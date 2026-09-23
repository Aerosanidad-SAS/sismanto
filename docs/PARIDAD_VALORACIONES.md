# Paridad SISRES → SISMANTO: Valoraciones médicas

Auditoría línea por línea del módulo, hecha el 2026-09-23 (solo lectura, sin cambios de código). Resuelve la sección 2.1 de `docs/PARIDAD_SISTEMA.md` (PR #14), que la marcaba como "la menos verificada".

**Qué se leyó:** SISRES → `registroValoracion.php`, `includes/insertarValoraciones.php`, `mostrarValoraciones.php`, `delete.php`, `tcpdf/DescargarValoracion_PDF.php`, `tcpdf/EnviarValoracionCorreo.php`. SISMANTO (`dev` al 2026-09-23) → `valoraciones/page.tsx`, `valoraciones-tabla.tsx`, `actions/valoraciones.ts`, `assessmentSchema`, migraciones 039/046/058 y el ETL.

**Qué NO se verificó:** nada se ejecutó contra Supabase ni contra datos reales de SISRES. Lo marcado ⚠️ depende de datos o de una decisión y se debe confirmar antes de programarlo.

## 1. Bugs en lo que ya existe en SISMANTO

| # | Hallazgo | Evidencia | Gravedad |
|---|----------|-----------|----------|
| B1 | La tarjeta **"Con concepto APTO" también cuenta los NO APTO** | `page.tsx`: `.includes("APTO")` y `"NO APTO".includes("APTO")` es `true` (comprobado). La insignia de la tabla sí revisa "NO" primero, así que tabla y tarjeta se contradicen | Alta — dato equivocado en pantalla |
| B2 | **Lista cortada en 500 sin aviso**, sin paginación. La búsqueda y las dos tarjetas solo ven esas 500 | `getValoraciones()`: `.limit(500)`. "Valoraciones registradas" muestra `min(500, total)` | Alta — mismo defecto que tenía Pacientes (PR #19) |
| B3 | **`valoracion` es texto libre**: "apto", "Apto ", "NO  APTO"… SISRES es un select cerrado APTO / NO APTO | `CAMPOS_TEXTO` en la tabla; `optStr` en el esquema | Media — corrompe estadísticas y el PDF futuro |
| B4 | **Género, aerolínea, origen, destino y estado también son texto libre.** SISRES: género = select de 6 opciones, aerolínea = select de la tabla `aerolineas`, origen/destino = buscador de aeropuertos, estado = ACTIVO/INACTIVO | `registroValoracion.php` líneas 110-190 | Media |
| B5 | **Médico y pasajero se escriben a mano.** En SISRES el médico es el usuario que registra y el pasajero es el nombre del paciente (campos ocultos) | `registroValoracion.php` 194-195 | Media — se puede firmar a nombre de otro médico |
| B6 | **No hay botón Eliminar** (la acción `eliminarValoracion` existe pero nadie la llama). Además hace `DELETE` físico; SISRES **desactiva** (`accion => 'soft'` en `delete.php`) | `valoraciones-tabla.tsx` solo tiene "Editar" | Media |
| B7 | **No autocompleta el paciente por cédula.** SISRES busca en `paciente` y llena nombre, fecha de nacimiento y género | El componente `PatientSearchCombobox` y `buscarPacientePorCedula` ya existen en SISMANTO (se usan en Servicios) | Baja — pero es la mayor fricción al registrar |
| B8 | **No se muestra la edad** (SISRES tiene columna EDAD) | Tabla sin columna; se puede calcular de `fecha_nacimiento`, como en Pacientes | Baja |

Nota: se sospechó que ANALISTA veía el botón "Nueva valoración" sin poder guardar (la política original de 039 solo permite ADMIN y MEDICO). **Descartado**: la migración 046 le da escritura a ANALISTA. Sin hallazgo.

## 2. Funciones que SISRES tiene y SISMANTO no

| # | Función | SISRES | SISMANTO | Notas |
|---|---------|--------|----------|-------|
| F1 | **Certificado PDF** | `DescargarValoracion_PDF.php` (TCPDF): logo, N°, fecha y hora, sede (= origen), N° HC, datos del paciente, valoración, aerolínea, vuelo, recomendaciones, concepto médico, líneas de firma de médico / pasajero / acompañante | No existe | `@react-pdf/renderer` ya está instalado (`hoja-vida-biomedica.tsx`). No requiere migración |
| F2 | **Enviar el certificado por correo** | `EnviarValoracionCorreo.php` (PHPMailer, al correo del pasajero) | No existe | Bloqueado por F3 y por `enviarCorreo()`, que **no soporta adjuntos** (solo HTML) |
| F3 | **Correo del pasajero** | Columna `correo` en `valoraciones` y campo E-mail en el formulario | **La tabla `medical_assessments` no tiene esa columna** y el ETL tampoco la migra | Requiere migración |
| F4 | **Catálogo de aerolíneas** | Tabla `aerolineas` (con permiso de eliminación propio) | No existe | Compartido con Captación aeroportuaria (`PARIDAD_SISTEMA.md` 1.3) |
| F5 | **Catálogo de aeropuertos + buscador** | `buscarAeropuertoAjax.php`, tabla `aeropuertos` | No existe | Igual que F4; el buscador ya se corrigió en SISRES el 2026-08-28 |
| F6 | **Campos obligatorios configurables** | `valoracionCamposConfig.php` + pantalla de configuración | No existe | ⚠️ Confirmar si el equipo quiere replicar este patrón (hoy SISMANTO valida con Zod fijo) |
| F7 | **Bitácora** al registrar/editar/eliminar | `registrarLog(...)` | No verificado | ⚠️ Confirmar cómo audita SISMANTO el resto de módulos antes de decidir |
| F8 | Firma digital (canvas / Wacom) | El campo existe pero `DOCUMENTACION.md` de SISRES documenta que **nunca funcionó** (`firma` siempre vacía) | — | **No portar.** Decisión de negocio si se quiere firma real |

## 3. Datos: lo que el ETL pierde o mezcla ⚠️

`cargarValoraciones` en `scripts/etl-sisres.ts`:

- **Dos columnas de SISRES se mezclan en una.** `estadoServicio` (select del formulario: `0` = ACTIVO, `1` = INACTIVO) y `estado` (bandera de activo: `1` = activo, se usa en la lista como insignia y para el borrado suave) se cargan así: `v(f, "estadoServicio", "estado")`, o sea, `estadoServicio` gana y `estado` se ignora. Resultado: **una valoración desactivada (borrada) en SISRES entra a SISMANTO como una normal**, y el campo `estado` queda con "0"/"1" sin significado claro.
- No se migran `correo`, `edad` (derivable), `usuarioRegistra` (SISMANTO tiene `created_by`) ni `firma`.
- **Por confirmar con datos reales:** cuántas valoraciones desactivadas hay en producción y qué valores tiene `estadoServicio`. Sin eso no se puede decidir el mapeo correcto.

## 4. Orden propuesto (a discutir con el equipo)

| PR | Contenido | Migración | Depende de |
|----|-----------|-----------|-----------|
| **V1** | B1, B2, B3, B5, B7, B8: arreglar el contador, paginar y buscar en el servidor (mismo patrón del PR #19), selects cerrados para valoración/género/estado, médico y pasajero automáticos, autocompletar paciente por cédula | No | — |
| **V2** | F1: certificado PDF descargable | No | V1 (para que `valoracion` sea confiable) |
| **V3** | B6 + §3: columna `activo` para borrado suave, botón Eliminar, corregir el ETL | Sí | Confirmar datos (§3) |
| **V4** | F4/F5: catálogos de aerolíneas y aeropuertos y sus selectores | Sí | Decisión conjunta con Captación (1.3) |
| **V5** | F2/F3: columna `correo` + envío por correo con PDF adjunto | Sí | V2 + soporte de adjuntos en `enviarCorreo()` |
| — | F6, F7 | — | Decisión del equipo |

## 5. Preguntas abiertas

1. ¿Qué significa hoy `estadoServicio` en producción y hay valoraciones desactivadas? (§3)
2. ¿Quién puede eliminar? En SISRES es un permiso propio (`act_eliminar_valoracion`); en SISMANTO no hay regla definida.
3. ¿El certificado se sigue enviando al correo del pasajero? Implica guardar un correo personal en la base y mandar un documento clínico por correo.
4. ¿El PDF debe ser idéntico al de SISRES o se acepta un diseño nuevo con los mismos datos?
5. ¿Se replican los campos obligatorios configurables (F6) o se deja la validación fija?
