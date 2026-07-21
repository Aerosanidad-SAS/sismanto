# Bolsa de QA — integración SISRES

Hallazgos que Daniel va reportando probando `sismanto-staging.vercel.app`. Cada uno queda acá con su estado — no se pierde nada aunque se resuelva en otra sesión.

## Convenciones

- **✅ Resuelto** — con el commit que lo corrigió.
- **🟡 Parcial** — se resolvió lo que se podía sin datos externos; falta algo (normalmente un catálogo real de SISRES que solo León puede exportar).
- **⏳ Pendiente** — sin empezar.

---

## Módulo Pacientes — formulario "Nuevo paciente" (2026-07-21)

| # | Hallazgo | Estado |
|---|---|---|
| 1 | Tipo de documento era texto libre — SISRES tiene un catálogo cerrado de 12 valores | ✅ Dropdown con los 12 valores reales (verificados en `sisres/registroPacientes.php`) |
| 2 | Sexo debía ser dropdown | ✅ Dropdown con los 6 valores reales de SISRES |
| 3 | EPS debía ser dropdown | 🟡 Sigue como texto libre. SISRES la alimenta desde una tabla `eps` propia en su base — necesito que León exporte esa tabla para no inventar la lista. Mientras tanto sigue funcionando como texto libre. |
| 4 | El documento de identidad debe tener las restricciones propias del caso | ✅ Si hay fecha de nacimiento y el paciente es menor de edad, "CEDULA CIUDADANIA"/"CEDULA EXTRAJERIA" no aparecen como opción; si es mayor de edad, no aparecen los documentos exclusivos de menor (Registro Civil, Tarjeta de Identidad, Certificado Nacido Vivo, Menor sin Identificación). Sin fecha de nacimiento no se restringe nada (no hay forma de saber la edad). |
| 5 | La estatura debe mostrar en gris desactivado la unidad "cm" | ✅ Sufijo "cm" fijo dentro del campo, igual que el placeholder "Ej: 168" que ya usa SISRES |
| 6 | Departamento: dropdown con los 33 departamentos de Colombia + filtro dinámico al escribir | ✅ Combobox buscable (mismo componente que ya se usa en Mantenimientos) con la lista oficial DIVIPOLA — es una lista fija que no depende de León |
| 7 | Ciudad: ¿SISRES la tiene como catálogo? | Sí — encontrado en el código: `sisres/registroPacientes.php` + `includes/getMunicipios.php` arman un dropdown en cascada (ciudad depende del departamento elegido) contra una tabla `subregiones` (columnas: `id`, `nombre_mpio`, `codigo_dto`, `nombre_departamento`). 🟡 No lo repliqué todavía porque construir esa cascada con datos inventados (en vez del export real de `subregiones`) podría no coincidir con los municipios que SISRES realmente tiene cargados. Sigue como texto libre hasta tener ese export. |
| 8 | Definir campos mínimos requeridos | ⏳ Pendiente — hoy solo son obligatorios cédula, tipo de documento, nombre1 y apellido1 (los que ya eran `NOT NULL` en la tabla). Falta que Daniel/León definan la lista completa. |

**Para desbloquear el 🟡/⏳ de arriba, pedirle a León:**
1. Export de la tabla `eps` (columna `entidad`).
2. Export de la tabla `subregiones` completa (para poblar departamento→ciudad en cascada con datos reales, no inventados).
3. Confirmar campos mínimos obligatorios del formulario de pacientes.

---

## Módulo Servicios médicos — formulario "Nuevo servicio" (2026-07-21)

Esta ronda sí se verificó contra el código real de `sisres/registroServicios.php` antes de tocar nada (no se había hecho la primera vez, de ahí que la lista de tipos de servicio no coincidiera).

| # | Hallazgo | Estado |
|---|---|---|
| 1 | Faltaban tipos de servicio (medicina domiciliaria, enfermería domiciliaria, TAB/TAM, telemedicina) | ✅ Ya estaban los 9 valores reales desde el commit `7e23aaa` (Ronda 2 de León) — si en staging seguías viendo la lista vieja era el deploy de Vercel sin propagar todavía, no código sin corregir. Confirmá con refresco fuerte (Ctrl+Shift+R). |
| 2 | Tipo de servicio debe ser un campo de texto con autocompletado (filtra coincidencias mientras escribís) | ✅ Combobox buscable (antes era un `<select>` cerrado) |
| 3 | Turno: Diurno/Nocturno | ✅ Dropdown. Guarda los valores reales de SISRES (`DIA`/`NOCHE`), la etiqueta visible dice "Diurno"/"Nocturno" |
| 4 | Lógica de campos según tipo de servicio (qué campos se habilitan según lo elegido) | ⏳ Pendiente — es el tema de la reunión con León de hoy mismo. No se toca hasta tener esa definición. |
| 5 | Cada campo debe tener placeholder | ✅ Placeholders en todos los campos de texto libre del formulario |
| 6 | Prestador: lista real del sistema | 🟡 Encontrado en el código: en SISRES, "Prestador" y "Proveedor" salen de la **misma tabla** `proveedores` (`SELECT * FROM proveedores`) — no son catálogos separados. Aeromanto no tiene esa tabla migrada todavía (el `suppliers` que ya existe es de proveedores de flota/repuestos, un catálogo distinto). Sigue como texto libre hasta el export real de León. |
| 7 | Código CIE-10: lista real de una base de datos | ✅ Ya existía el buscador (`getCatalogoCie`, contra la tabla `cie10` que se migró en la Fase 3) pero no estaba conectado a ningún campo del formulario — ahora sí, con autocompletado en vivo. |
| 8 | Requiere aislamiento: lista real | ✅ No era "SI/NO" como se había asumido — son 7 tipos de precaución reales (Contacto, Aéreo, Aerosol, Gotas, Protector, Vectores, N/A), ahora en dropdown |
| 9 | Finalidad del traslado: lista real | ✅ Dropdown con los 9 valores reales de SISRES |
| 10 | "IPS que acepta" → renombrar a "Persona que recibe en IPS", con opción "Entrega en domicilio" | ✅ Renombrado; combobox con esa opción fija más texto libre para el nombre |
| 11 | Departamento origen/destino: los 33 departamentos de Colombia | ✅ Mismo combobox que ya se usa en Pacientes |
| 12 | Ciudad origen/destino: catálogo dependiente del departamento | 🟡 Mismo caso que en Pacientes — sigue como texto libre hasta el export real de `subregiones` |
| 13 | Todas las fechas del sistema en formato dd/mm/aaaa (incluidos los placeholder) | ⏳ Pendiente — **no es un cambio trivial de una sola pantalla**. Los campos de fecha hoy son `<input type="date">`/`type="datetime-local">` nativos del navegador: el formato que ves ("mm/dd/yyyy") lo decide el navegador/Windows, no el código de la página — por eso cambiar solo este formulario no alcanza. Para forzar dd/mm/aaaa en todo el sistema hay que reemplazar los inputs nativos por un componente de fecha propio (librería tipo `react-day-picker`, que ya está disponible vía shadcn) en **todos** los formularios, no solo este. Es un cambio transversal — antes de arrancarlo prefiero que Daniel lo confirme, porque toca every formulario con fecha del sistema. |

**Bonus (no pedido, pero se encontró en el mismo archivo y era gratis agregarlo):**
- **Método de pago**: dropdown con los 9 valores reales de SISRES (antes texto libre).
- **Perímetro**: dropdown con los 3 valores reales (Metropolitano/Urbano/Rural).
- **Cliente / aseguradora**: combobox contra la tabla `clients` real de Aeromanto (ya migrada en la Fase 3, no se estaba usando en este formulario).

**Para desbloquear lo que sigue 🟡/⏳, pedirle a León (se puede sumar a la lista de arriba):**
1. Export de la tabla `proveedores` (sirve para Prestador y Proveedor a la vez).
2. Confirmar si vale la pena el esfuerzo de reemplazar los inputs de fecha nativos por un date-picker propio en dd/mm/aaaa en todo el sistema.

---

## Cómo se usa este archivo

Cuando Daniel reporte un hallazgo nuevo: se agrega una fila (o una sección nueva si es de otro módulo) con su estado. Cuando se resuelve, se marca ✅ con una nota de qué se hizo. No se implementan catálogos con datos inventados cuando SISRES los tiene reales — se marca 🟡/⏳ y se pide el export en vez de adivinar.
