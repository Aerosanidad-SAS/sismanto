---
name: aeromanto-context
description: Contexto de negocio, stakeholders, prioridades estratégicas y estilo de comunicación de Aeromanto (sistema interno de gestión de flota de Aerosanidad S.A.S, construido por Innovizar como herramienta dedicada). Actívala cuando Daniel pida ayuda con producto, estrategia, adopción/capacitación, comunicaciones internas, reportes a gerencia, priorización de features, decisiones de roadmap o cualquier tarea de negocio que no sea código puro. NO actives para tareas estrictamente técnicas — CLAUDE.md ya las cubre.
---

# Aeromanto — Contexto de negocio

## Identidad

**Aeromanto** es el sistema interno de gestión de flota de **Aerosanidad S.A.S** (NIT 900236791), construido por **Innovizar** (la operación de Daniel López) como **herramienta dedicada** — no es un SaaS, no se comercializa fuera de Aerosanidad. Sector: aeromédico (salud + aviación), Colombia.

**Equipo de desarrollo**: solo Daniel. Founder + product owner + único dev + soporte + capacitador. Toda decisión de producto, código o comunicación pasa por una sola persona con tiempo limitado. Esta restricción es **estructural**, no temporal.

## Stakeholders internos y qué les importa

Cada rol del RBAC tiene un usuario real detrás. Priorizar features y comunicaciones según lo que cada rol *realmente* necesita, no según lo que es técnicamente interesante:

- **OVEM (conductores)**: portal rápido y simple en celular. Métrica clave: minutos para hacer el check diario. Frustración típica: re-loguearse, formularios largos, datos que ya ingresaron antes.
- **Regulación**: estado de la flota en tiempo real para asignar conductores. Métrica clave: tiempo entre "necesito un vehículo" y "asigné uno". Frustración: datos desactualizados, no saber qué vehículo está realmente disponible ahora.
- **Mantenimiento**: registrar y planear mantenimientos sin perder historial. Frustración: duplicar registros, perder facturas físicas, no encontrar el historial de una placa.
- **Coordinación**: visión transversal de flota + gestión de capacitaciones. Frustración: armar reportes manualmente cruzando fuentes.
- **Gerencial**: dashboards e indicadores listos para reuniones, **solo lectura**. Lo que valoran: poder responder preguntas de junta sin pedirle datos a nadie en el momento.
- **Admin (Daniel)**: gestión de usuarios, configuración, soporte.

## Foco estratégico — próximos 90 días

Dos frentes simultáneos. Cualquier propuesta debe encajar en uno de los dos o se descarta:

### 1. Adopción interna y capacitación
Que los roles arriba *realmente* usen el sistema. Hoy esto no se asume — se valida con uso real.

- Priorizar **fricción cero** sobre features nuevas para el mismo rol.
- Materiales de entrenamiento **por rol**, no genéricos.
- Onboarding diferenciado: OVEM ve menos pantallas que Coordinación.
- Métricas que importan: usuarios activos por rol, % de tareas completadas en el sistema vs. fuera de él (Excel, WhatsApp, papel).

### 2. Features de IA y reporting
AI Chat, AI Insights, predicciones, dashboards gerenciales.

- Cada feature de IA debe contestar **una pregunta concreta que un rol específico hoy responde a mano**.
- Antes de construir, pregunta: "¿quién hace esto hoy y cuánto tiempo le toma?".
- Reporting gerencial > reporting operativo cuando hay conflicto de tiempo.

### Lo que NO es foco ahora
- Comercialización a terceros (no aplica — herramienta interna).
- Integraciones externas que no desbloqueen adopción.
- Refactors de calidad técnica sin impacto al usuario.
- Multi-tenant, internacionalización, marketplace, etc.

## Decisiones ya tomadas (no re-debatir)

- **Stack**: Next.js 14 + Supabase + shadcn/ui + Recharts. No migrar.
- **Modelo**: herramienta interna, no SaaS. No diseñar pensando en multi-tenant.
- **Idioma**: español Colombia. No internacionalizar.
- **Roles**: los 6 del RBAC son los actuales. Si surge necesidad de un rol nuevo, primero evaluar si encaja en uno existente.
- **Hosting/DB**: Supabase con RLS. Las políticas de acceso viven en migraciones, no en el dashboard.

## Restricciones operativas (siempre considerar)

- **Recurso más escaso: tiempo de Daniel**. Toda recomendación debe considerar costo-beneficio en horas-persona de un solo dev.
- **Sin equipo de QA**: las pruebas son manuales o automatizadas por el mismo Daniel.
- **Sin presupuesto de marketing/ventas**: no aplica.
- **Sector sensible**: aeromédico = salud + aviación. Datos sensibles, decisiones con impacto operacional real (vidas, cumplimiento regulatorio aeronáutico).
- **Usuarios no nativos digitales**: muchos OVEM y personal operativo no son power-users. El sistema compite contra "lo hago en Excel" o "lo apunto en papel".

## Tono de comunicación — profesional cercano

Para correos, reportes, propuestas internas, anuncios a usuarios, notas de release:

- **Claro y respetuoso**, sin formalismos rígidos. "Cordial saludo" sí, "Reciba un atento saludo" no.
- **Usted** por defecto al dirigirse a usuarios de Aerosanidad; **tú** solo entre equipo técnico cercano o cuando el destinatario ya lo usa.
- **Frases cortas y concretas**. Evitar muletillas corporativas ("a efectos de", "con miras a", "en aras de").
- **Listas y bullets** cuando hay más de 3 items.
- **Sin jerga técnica** en comunicaciones a roles no-técnicos (OVEM, Gerencial). "Base de datos" no, "registros" sí.
- **Datos concretos** en reportes: números, fechas, comparativos. No adjetivos sin evidencia ("mucho mejor" → "30% más rápido").
- **Cierres breves**. No "quedo atento a sus comentarios y cualquier inquietud no dude" — basta con "Atento a comentarios."

## Heurísticas de decisión rápidas

Cuando Daniel pida priorizar, recomendar o decidir:

- **Feature nueva vs. pulir existente** → casi siempre pulir, salvo que la nueva desbloquee adopción de un rol que hoy no usa el sistema.
- **Reporte gerencial vs. operativo** → gerencial gana si compiten por tiempo (visibilidad del producto frente a quien decide su continuidad).
- **Automatizar con IA vs. simplificar la UI** → simplificar UI primero; la IA sobre un flujo confuso amplifica la confusión.
- **Pedir feedback de usuarios** → preguntar por tareas concretas ("muéstrame cómo hiciste X la última vez"), no por opiniones ("¿qué te parece el sistema?").
- **Reunión de capacitación** → máximo 30 minutos, por rol, con sistema abierto en pantalla, sin slides.

## Cómo usar esta skill

Actívala cuando Daniel:

- Pida priorizar features o redefinir roadmap.
- Pida redactar correos, reportes, propuestas, anuncios o notas de release.
- Pida diseñar capacitaciones, materiales de onboarding o estrategias de adopción.
- Pida decidir el alcance de una feature (pregúntale "¿qué pregunta concreta de qué rol resuelve?").
- Pida analizar adopción o métricas de uso.
- Pida ayuda con comunicación a stakeholders (gerencia, usuarios operativos, equipo).
- Discuta decisiones estratégicas o trade-offs de producto.

No la actives para:
- Tareas puras de código (bugs, refactors, migrations, types) — CLAUDE.md las cubre.
- Preguntas genéricas sobre Next.js, Supabase, etc.
