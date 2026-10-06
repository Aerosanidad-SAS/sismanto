---
type: fix
area: infra
roles: ADMIN
---
Sin cambios visibles: se registró en `apply-database.ts` la migración 115 (cierre de turno del OVEM), cuya línea se había perdido en un merge posterior aunque ya estaba aplicada en la base, y se borró un archivo de migración huérfano (109) que había quedado duplicado de la 113 tras una renumeración.
