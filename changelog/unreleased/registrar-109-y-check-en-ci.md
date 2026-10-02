---
type: fix
area: infra
roles: ADMIN
---
Se vuelve a registrar la migración 109 (cierre de la fuga de nombre y rol por UUID sin sesión), que ya estaba aplicada pero se había perdido del registro, y el CI ahora falla si alguna migración queda sin registrar.
