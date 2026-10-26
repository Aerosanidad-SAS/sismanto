# Pasada de usuarios de SISRES a SISMANTO (clave inicial = cédula)

Decisión de David (2026-10-26): todo el personal entra la primera vez con su **cédula como clave**, y la pantalla le obliga a
cambiarla. ADMIN, ANALISTA y GERENCIAL **no** entran con la cédula: reciben una clave propia (la carga masiva ya lo exige:
una fila de esos roles sin `password_inicial` se rechaza).

## Cómo funciona (ya existía en la carga masiva)

- Administración → Usuarios → carga masiva (`src/components/admin/usuarios-carga-masiva.tsx`, acción `usuarios-carga.ts`): si la
  fila no trae `password_inicial`, la clave es la cédula. Crea la cuenta con `debe_cambiar_password = true`.
- Al primer ingreso el panel redirige a `/cambiar-password` (`src/app/(dashboard)/layout.tsx`). La clave nueva no puede ser la
  cédula ni el código de acceso, ni tener menos de 8 caracteres (`validarClaveNueva`).
- Se entra con la **cédula o el correo**. Quien no tiene correo recibe uno interno (`usuario.<cédula>@sismanto.invalid`) y
  **no puede recuperar la clave por correo**.
- Las cédulas de menos de 8 dígitos no pueden ser clave: reciben una clave aparte (como los roles de clave propia).

## Cómo se limpia la cédula (campo `usuario` de SISRES)

El convertidor deja la cédula solo con dígitos y esa misma cédula es la clave inicial:

- Quita **puntos y comas de miles** (`1.020.458.300`, `1,020,458,300`) y espacios.
- **Un punto que NO es de miles es un decimal** que dejó SISRES (`1234567.0`): la cédula es lo que está **antes** del punto. Quitarlo
  a ciegas le agregaría un dígito (`12345670`) y la clave quedaría mal. En el archivo de octubre había 3 casos así.
- Si el `usuario` no es una cédula (p. ej. `1.5`), se usa `identificacion` y queda como aviso. Si `usuario` e `identificacion`
  no coinciden, manda `usuario` (con lo que se entraba a SISRES) y queda como aviso para revisar.
- La clave queda **vacía en la plantilla** a propósito: significa «la clave es la cédula» y la vista previa de la carga lo marca así.

## Pasos

1. Exportar la tabla `usuarios` de SISRES a CSV **solo con las columnas necesarias** (`id, usuario, identificacion, nombre1,
   nombre2, apellido1, apellido2, cargo, correo, ciudad, estado`). **Sin** la columna de contraseñas.
2. Guardar el CSV y la salida en una carpeta **local, fuera del repo y que NO se sincronice** (OneDrive, Dropbox, Google Drive,
   iCloud): ahí quedan cédulas y claves en claro. El script se niega a escribir dentro del repo y en carpetas sincronizadas.
3. Convertir (no escribe en ninguna base):

   ```bash
   npx tsx scripts/usuarios-sisres-a-plantilla.ts <usuarios.csv> --salida <carpeta-local-fuera-del-repo>
   ```

   Opciones:
   - `--roles-clave-propia REGULACION,COORDINACION` suma roles que tampoco entran con la cédula (ver «Riesgos»).
   - `--estados 1,2` estados de SISRES que se cargan (por omisión solo `1`, activo; los demás se omiten como inactivos).
   - `--centros-por-ciudad "CARTAGENA=CTG,CÚCUTA=ADO"` centro de las ciudades que no son Bogotá ni Medellín: sin esto, los roles
     que ven solo su centro de esas ciudades se omiten.
   Se niega a correr si la carpeta ya tiene archivos de una corrida anterior (las claves ya no coincidirían).
4. Revisar `usuarios-omitidas.csv` (quién NO entra y por qué: cargo sin equivalente, ciudad que no es solo Bogotá o solo Medellín
   en un rol que necesita centro, inactivo, cédula fuera de 5–15 dígitos…) y `usuarios-avisos.csv` (correo repetido o inválido,
   cédulas que venían con ceros a la izquierda). Resolver a mano lo que haga falta.
5. Subir `usuarios-plantilla-01.xlsx` (y los siguientes; máximo 500 filas cada uno) en la pantalla de carga masiva con una
   sesión de ADMIN. **Mirar la vista previa** antes de confirmar. Un correo que ya exista en Auth solo falla al confirmar.
6. Entregar en persona las claves de `claves-iniciales-especiales.csv`.
7. **Borrar TODA la carpeta de salida** (los `.xlsx` también llevan esas claves en claro, no solo el CSV de claves).
8. Avisar a la gente el mismo día y pedir que entren ese día (ver «Riesgos»).

## Riesgos que se aceptan (léelos antes de cargar)

La cédula **no es secreta** (la ven compañeros, nómina, carnés). Esta base es también la de producción y guarda datos clínicos.

1. **Cuentas abiertas hasta el primer ingreso.** Quien no entre queda con una cuenta que abre con su cédula, sin vencimiento.
   El primero que entre «gana» la cuenta: puede fijar su propia clave y dejar fuera al titular.
2. **Una sola cuenta tomada delata a las demás.** REGULACION y COORDINACION leen todos los perfiles (con cédula y
   `debe_cambiar_password`); una de esas cuentas, tomada con la cédula, entrega la lista exacta de cuentas aún abiertas.
   Por eso conviene sumar `--roles-clave-propia REGULACION,COORDINACION` (y valorar MEDICO y AUXILIAR_ENFERMERIA, por los pacientes).
3. **`debe_cambiar_password` NO limita el acceso a los datos.** Solo lo hace cumplir el layout del panel (redirige a
   `/cambiar-password`). Quien tiene la sesión y no ha cambiado la clave puede llamar server actions o PostgREST directamente:
   ni `requireAuth`/`getProfile` ni la RLS lo miran. No es un candado.
4. **Límite de intentos del login.** `signIn` no tiene límite propio; depende del de Supabase Auth, que ve la IP del servidor
   (Vercel), no la de quien intenta: el tope funciona como global. Un tercero puede provocar el «Demasiados intentos» para todos, y
   300 personas entrando casi a la vez el día de la carga pueden toparlo. **Probarlo en staging y revisar Auth → Rate limits
   antes de avisar al personal.** Mitigación: cargar y avisar por grupos o sedes, no todos el mismo día.
5. **Sesiones.** No está confirmado que cambiar la clave con `updateUserById` cierre las sesiones ya abiertas.
6. **Registro público de Supabase Auth** sigue pendiente (`AUDITORIA_SEGURIDAD_2026-10-01.md`).

Siguientes PR sugeridos (fuera de esta preparación): que `requireAuth` redirija a `/cambiar-password`; que `getProfile` no falle
abierto (el reintento sin la columna solo para el error `42703`); cerrar las demás sesiones tras `cambiarClaveInicial`;
vencimiento de la clave inicial; y una vista de «quién sigue sin cambiar la clave».

## Ver quién sigue abierto

No hay pantalla para esto todavía. Como ADMIN, en el editor SQL de Supabase (solo lectura):

```sql
-- Cuántas cuentas siguen con la clave inicial, por rol (sin datos personales)
select r.codigo as rol, count(*) as sin_cambiar_clave
from user_profiles up join roles r on r.id = up.role_id
where up.debe_cambiar_password and up.activo
group by r.codigo order by sin_cambiar_clave desc;

-- Quiénes son (datos personales: no lo pegues en chats ni en PR)
select up.nombre_completo, r.codigo as rol, up.created_at
from user_profiles up join roles r on r.id = up.role_id
where up.debe_cambiar_password and up.activo
order by up.created_at;
```

Pasados unos días: a quien siga ahí, restablecerle la clave o desactivarlo.

## Qué NO hace

- No envía correos ni mensajes.
- No toca a quien ya tiene perfil (la carga masiva lo reporta como «ya existe»): esas claves no se cambian.
- No adivina el centro: solo Bogotá y Medellín tienen regla oficial (`src/lib/servicios-centro.ts`); una ciudad que no sea
  exactamente una de las dos (o que nombre las dos) deja a los roles que ven solo su centro en `usuarios-omitidas.csv`.
- No revisa qué ve cada rol que no necesita centro (VISTA, TECNICO, AEROPUERTO, MANTENIMIENTO) sin centro asignado: confirmarlo
  con quien sea dueño de esos roles antes de cargarlos.
