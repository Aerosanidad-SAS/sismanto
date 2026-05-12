# Roadmap IA — Aeromanto

## Objetivo

Usar analítica e IA para detectar patrones operativos y apoyar decisiones sobre:

- desempeño por conductor (OVEM),
- relación entre novedades, mantenimientos y comportamiento operativo,
- oportunidades de reducción de costos/tiempos fuera de servicio,
- alertas tempranas de riesgo por vehículo, centro y turno.

## Alcance inicial (lectura solamente)

Primera etapa sin acciones automáticas. Solo generación de:

- reportes de riesgo,
- ranking de anomalías,
- recomendaciones priorizadas para revisión humana.

No se deben ejecutar cambios de estado ni sanciones automáticas basadas en IA.

## Fuentes de datos candidatas

- `maintenance_records`, `maintenance_items`
- `incidents`
- `fuel_logs`
- `daily_checks`, `daily_check_items`
- `vehicle_assignments`
- `mileage_logs`
- `vehicle_status_history` (migración 010)
- `maintenance_plan_items`, `vehicle_maintenance_log`, `vehicle_maintenance_alerts` (migración 012)
- módulo de capacitaciones (migración 014): cursos, intentos, calificaciones

## Casos de uso priorizados

1. **Correlación conductor–novedad–mantenimiento**
   - Señalar combinaciones con frecuencia anómala (conductor/placa/tipo de daño).
2. **Predicción de riesgo operativo por vehículo**
   - Probabilidad de entrar a FDS en ventana de 7/15/30 días.
3. **Rendimiento combustible y desvíos**
   - Desviación de km/gal frente a baseline por vehículo/centro.
4. **Efectividad de capacitación**
   - Evolución antes/después de capacitación por conductor y tipo de novedad.

## Arquitectura recomendada (fase futura)

1. **Capa de datos analíticos**
   - vistas/materialized views en Postgres para features agregadas,
   - jobs programados (diario/semanal) para snapshots.
2. **Servicio IA**
   - API server-side (no exponer llaves en cliente),
   - proveedor LLM + reglas de negocio,
   - prompt templates versionados.
3. **Módulo de insights**
   - dashboard de hallazgos con trazabilidad de evidencia.

## Gobernanza y seguridad

- Minimizar PII en prompts.
- Retención controlada de resultados IA.
- Explicabilidad obligatoria para cada recomendación.
- Toda decisión sensible debe ser validada por usuario humano (Admin/Coordinación).

## Métricas de éxito

- Reducción de incidencias repetitivas por 1000 km.
- Reducción de TFDS promedio.
- Mejora de km/gal en cohortes comparables.
- Tiempo de respuesta a alertas operativas.

## Notas de implementación

- Mantener este documento en sincronía con `docs/CONTEXTO_PARA_IA.md`.
- No implementar inferencia online hasta estabilizar calidad histórica de datos.
