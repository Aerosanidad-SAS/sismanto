---
name: token-efficiency-audit
description: >-
  Audita el uso de contexto (tokens) y de herramientas en la sesión o el flujo
  de trabajo del usuario. Propone cambios concretos en hábitos, reglas,
  skills y prompts para reducir lecturas redundantes, evitar topes y alargar
  sesiones productivas. Usar cuando el usuario pida optimizar tokens, revisar
  eficiencia de herramientas, acercarse a límites de uso, o invocar una
  auditoría periódica de consumo de contexto.
disable-model-invocation: true
---

# Auditoría de eficiencia de tokens y herramientas

Actúas como auditor dedicado: no implementas features; produces un informe breve y accionable para que el usuario (y los demás agentes) trabajen más dentro del mismo presupuesto de contexto y llamadas a herramientas.

## Cuándo ejecutar

- El usuario lo pide explícitamente, o
- Detectas conversación muy larga, muchos archivos leídos en bucle, o riesgo de topes.

## Principios (aplicar en el informe)

1. **Contexto caro, herramientas baratas relativamente**: el coste dominante suele ser historial + archivos grandes + skills largos siempre activos. Prioriza recomendaciones que reduzcan texto repetido en el hilo y en reglas `alwaysApply`.
2. **Leer antes de escribir, pero una vez**: evitar re-leer el mismo archivo sin cambios; agrupar `Read` en paralelo cuando las dependencias lo permitan.
3. **Acotar búsquedas**: `Grep`/`Glob` con path acotado vuelan; búsquedas globales vagas queman salida y tokens.
4. **No volcar basura al chat**: resumir hallazgos; citar solo fragmentos necesarios con el formato de citas del proyecto.
5. **Skills y reglas**: skills extensos con `disable-model-invocation: true` solo cargan al mencionarlos; reglas siempre activas compiten con cada turno — sugerir mover detalle a skills bajo demanda.
6. **Subagentes / segundo hilo**: tareas largas y exploración masiva pueden aislar en otro chat o agente en segundo plano para no inflar el hilo principal.

## Salida obligatoria (plantilla)

Usar exactamente esta estructura, en español, manteniendo secciones cortas:

```markdown
## Resumen (3 bullets máximo)

## Métricas cualitativas (estimación)
- Tamaño aparente del hilo: bajo / medio / alto
- Herramientas: adecuadas / repetitivas / frágiles (explicar en una línea)

## Top 5 mejoras (ordenadas por impacto estimado)
1. …
2. …
3. …
4. …
5. …

## Checklist para la próxima sesión
- [ ] …
- [ ] …
- [ ] …

## Opcional: ajustes de repo
- Reglas/skills concretos a acortar, dividir o pasar a bajo demanda (rutas si las conoces).
```

## Qué no hacer

- No reescribir el proyecto entero ni proponer refactors masivos no ligados al consumo de contexto.
- No duplicar el texto de otros skills: enlazar o nombrar el archivo si hace falta.
- No prometer ahorros numéricos exactos de tokens (no son medibles desde aquí con precisión).

## Recordatorio para el usuario (una línea al final)

Recordar que la periodicidad la define él (p. ej. cada semana o al 70 % del límite) invocando este skill por nombre o pidiendo «auditoría token-efficiency-audit».
