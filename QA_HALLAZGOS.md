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

## Cómo se usa este archivo

Cuando Daniel reporte un hallazgo nuevo: se agrega una fila (o una sección nueva si es de otro módulo) con su estado. Cuando se resuelve, se marca ✅ con una nota de qué se hizo. No se implementan catálogos con datos inventados cuando SISRES los tiene reales — se marca 🟡/⏳ y se pide el export en vez de adivinar.
