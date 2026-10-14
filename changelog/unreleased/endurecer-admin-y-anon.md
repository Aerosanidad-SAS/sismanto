---
type: fix
area: seguridad
roles: todos
migration: 132
---
Se cierran dos puertas de seguridad en la base de datos: nadie sin sesión puede escribir en ninguna tabla aunque una regla futura lo permitiera, y las migraciones ya no convierten en administrador a ningún correo por defecto. No cambia nada de lo que ven los usuarios.
