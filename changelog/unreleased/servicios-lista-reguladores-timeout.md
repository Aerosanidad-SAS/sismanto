---
type: fix
area: servicios
roles: REGULACION, COORDINACION
---
La lista de Servicios vuelve a cargar para Regulación y Coordinación: antes salía «No se pudo cargar la lista de servicios: canceling statement due to statement timeout» porque la consulta tardaba más de 8 segundos (en Bogotá, unos 10); ahora tarda menos de medio segundo.
