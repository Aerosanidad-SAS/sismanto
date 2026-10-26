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

## Personas inactivas (estado 0 en SISRES)

Quien ya no trabaja pero sigue ligado a servicios históricos **tiene que existir** en SISMANTO, pero **no puede entrar**. Se cargan con
`--estados-inactivos 0` y la columna opcional **`activo = NO`** de la plantilla (vacío = SI):

- La carga masiva las crea **desactivadas** (`user_profiles.activo = false`, igual que «desactivar usuario»), sin exigirles centro ni clave.
- **Nunca** reciben la cédula como clave: el servidor les pone una clave al azar que nadie ve (y el convertidor ya la escribe al azar
  en el archivo, por si ese archivo llegara a una versión de la carga que no entienda `activo`).
- Van **sin correo** (la carga les crea uno interno): si esas filas llegaran a una versión que ignora `activo`, una cuenta activa con
  correo real podría entrar por «¿Olvidaste tu contraseña?». Costo: el correo del histórico no se carga (sigue en el CSV de SISRES);
  al reactivar a alguien hay que escribírselo.
- Van en **`usuarios-inactivos-NN.xlsx`**, aparte de las activas.
- Si una persona inactiva comparte cédula con una activa, **se queda la activa** (la inactiva se omite como cédula repetida y aparece
  en `usuarios-omitidas.csv`; si estaba ligada a servicios, hay que enlazarlos a la cuenta activa). Lo mismo si la activa se omitió
  (p. ej. sin centro): primero se resuelve la activa.
- Para reactivar a alguien: Administración → Usuarios → activar y **restablecer su clave** (tiene una al azar que nadie conoce).
  `toggleUserActive` **rechaza activar** a un rol que ve solo su centro (OVEM, REGULACION, MEDICO, AUXILIAR_ENFERMERIA, COORDINACION) si
  no tiene centro: asígnaselo antes.
- Una persona **activa** que ya exista y llegue como inactiva se omite como «ya existe»: la carga nunca modifica a quien ya existe.
- **Seguimiento:** desactivar es solo `user_profiles.activo = false`, sin bloqueo en Supabase Auth (es lo que ya hace «desactivar usuario»).
  La RLS y `getProfile` dejan sin acceso a una cuenta inactiva, pero un bloqueo en Auth cerraría también la posibilidad de abrir sesión.

**Orden de subida:** `usuarios-inactivos-NN.xlsx` solo se sube **después de desplegar este PR en el entorno donde se sube** (la carga
masiva que entiende `activo`; `main`/producción lo despliega Daniel a mano, y `dev`/`staging` comparten otra base).
Si se subiera antes, la columna se ignora y esas cuentas quedarían **activas** (con una clave al azar y sin correo real, no con la
cédula): habría que desactivarlas a mano de inmediato.

## Cómo se limpia la cédula (campo `usuario` de SISRES)

El convertidor deja la cédula solo con dígitos y esa misma cédula es la clave inicial:

- Quita **puntos y comas de miles** (`1.020.458.300`, `1,020,458,300`) y espacios.
- **Un punto que NO es de miles es un decimal** que dejó SISRES (`1234567.0`): la cédula es lo que está **antes** del punto. Quitarlo
  a ciegas le agregaría un dígito (`12345670`) y la clave quedaría mal. En el archivo de octubre había 3 casos así.
- Si el `usuario` no es una cédula (p. ej. `1.5`), se usa `identificacion` y queda como aviso. Si `usuario` e `identificacion`
  no coinciden, manda `usuario` (con lo que se entraba a SISRES) y queda como aviso para revisar.
- La clave queda **vacía en la plantilla** a propósito: significa «la clave es la cédula» y la vista previa de la carga lo marca así.

## Mapa de sedes (ciudad de SISRES → centro)

Solo Bogotá y Medellín tienen regla oficial (`src/lib/servicios-centro.ts`). Para las demás ciudades se usa
`--centros-por-ciudad`, con el mapa que David dio (la lista de sedes) y lo que se verificó sobre qué operador administra cada
aeropuerto (consultado el 2026-10-26; las concesiones pueden cambiar, confirmar si hay dudas):

| Centro | Ciudades | Fuente |
|---|---|---|
| `AIRPLAN` | Montería, Rionegro, Quibdó, Corozal, Carepa, Olaya Herrera | [Airplan, «Quiénes somos»](https://airplan.aero/web/page/33/Quienes-somos): opera Rionegro, Medellín, Montería, Quibdó, Carepa y Corozal |
| `ADO` | Cúcuta, Bucaramanga, Barrancabermeja, Valledupar, Santa Marta, Riohacha | Aeropuertos de Oriente S.A.S. administra esas seis terminales ([Portafolio](https://www.portafolio.co/negocios/skandia-compro-50-de-aeropuertos-de-oriente-532035), [Vanguardia](https://www.vanguardia.com/economia/nacional/70989-supertiendas-olimpica-y-nexus-operaran-seis-aeropuertos)) |
| `CTG` | Cartagena | SACSA tiene la concesión del aeropuerto Rafael Núñez ([El Universal](https://www.eluniversal.com.co/economica/2011/09/27/rige-prorroga-de-concesion-a-sacsa/)); `CTG` es además su código |

**Sin mapear a propósito** (no están en la lista de sedes): Los Palmitos, Itsmina, Sincelejo, Cereté, Cali y las personas sin
ciudad. En los roles que ven solo su centro quedan en `usuarios-omitidas.csv` hasta que alguien les asigne el centro.

Comando usado (el `--centros-por-ciudad` va entre comillas):

```bash
npx tsx scripts/usuarios-sisres-a-plantilla.ts <usuarios.csv> --salida <carpeta> --estados 1,2 --estados-inactivos 0 \
  --centros-por-ciudad "MONTERIA=AIRPLAN,RIONEGRO=AIRPLAN,QUIBDO=AIRPLAN,COROZAL=AIRPLAN,CAREPA=AIRPLAN,OLAYA HERRERA=AIRPLAN,CARTAGENA=CTG,CUCUTA=ADO,BUCARAMANGA=ADO,BARRANCABERMEJA=ADO,VALLEDUPAR=ADO,SANTA MARTA=ADO,RIOHACHA=ADO"
```

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
   - `--estados 1,2` estados de SISRES que se cargan como personas **activas** (por omisión solo `1`).
   - `--estados-inactivos 0` estados que se cargan como personas **inactivas** (ver arriba; por omisión ninguno).
   - `--centros-por-ciudad "CARTAGENA=CTG,CÚCUTA=ADO"` centro de las ciudades que no son Bogotá ni Medellín: sin esto, los roles
     que ven solo su centro de esas ciudades se omiten.
   Se niega a correr si la carpeta ya tiene archivos de una corrida anterior (las claves ya no coincidirían).
4. Revisar `usuarios-omitidas.csv` (quién NO entra y por qué: cargo sin equivalente, ciudad que no es solo Bogotá o solo Medellín
   en un rol que necesita centro, inactivo, cédula fuera de 5–15 dígitos…) y `usuarios-avisos.csv` (correo repetido o inválido,
   cédulas que venían con ceros a la izquierda). Resolver a mano lo que haga falta.
5. Subir `usuarios-plantilla-01.xlsx` (y los siguientes; máximo 500 filas cada uno) en la pantalla de carga masiva con una
   sesión de ADMIN. **Mirar la vista previa** antes de confirmar. Un correo que ya exista en Auth solo falla al confirmar.
   Después de desplegar este PR, subir igual `usuarios-inactivos-01.xlsx` y comprobar en Usuarios que quedaron **desactivadas**.
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
