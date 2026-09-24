# Squad de agentes de Aeromanto — y cómo reusarlo en otro proyecto

Cinco agentes con rol fijo y acceso mínimo (least privilege real, no solo en el texto — ver el campo `tools:` de cada uno):

| Agente | Rol | Herramientas | Por qué esas y no otras |
|---|---|---|---|
| **Atlas** | Orquestador/PM — parte la tarea y delega | Read, Grep, Glob, Write, Edit, Agent | Escribe documentación (PRD, changelog) y delega — no toca código de la app |
| **Vault** | Esquema de base de datos, migraciones, RLS | Read, Write, Edit, Grep, Glob | **Sin Bash** — a propósito. Produce el `.sql`, nunca lo corre él mismo |
| **Forge** | Implementación (Server Actions, UI, formularios) | Read, Write, Edit, Grep, Glob, Bash | Necesita Bash para `npm run build`/`lint` mientras trabaja |
| **Sentinel** | Tests (Vitest) | Read, Write, Edit, Grep, Glob, Bash | Necesita Bash para correr `npx vitest` |
| **Aegis** | Revisión final antes de commitear | Read, Grep, Glob | **Sin Write/Edit/Bash** — es de solo lectura por diseño, así no puede "arreglar mientras revisa" |

## El protocolo de mano a mano (handoff)

No hace falta nada especial para que un agente le entregue trabajo a otro "con contexto limpio": cada vez que se invoca un agente (herramienta `Agent`), arranca sin memoria de la conversación — solo ve lo que se le escribe en el prompt. Eso ya es el aislamiento que buscás. El commit de git es el punto de entrega: un agente termina, comitea, y el siguiente agente lee ese commit (no el razonamiento del anterior).

Orden típico (lo define Atlas, ver `atlas.md` §"Delegation Rules"):
`Vault → Forge → Sentinel → Aegis`

## Revisión automática en cada PR

`.github/workflows/claude-review.yml` corre a Aegis automáticamente cuando se abre o actualiza un Pull Request — en un runner de GitHub (efímero, aislado), sin necesitar Docker propio. Requiere el secreto `ANTHROPIC_API_KEY` en el repo (Settings → Secrets and variables → Actions).

## Cómo replicarlo en un proyecto nuevo

1. Copiar la carpeta `.claude/agents/` completa al nuevo repo.
2. Copiar `.github/workflows/claude-review.yml`.
3. Editar cada agente: cambiar las rutas de archivos y convenciones específicas de Aeromanto (`src/app/api/actions/`, `scripts/migrations/`, etc.) por las del proyecto nuevo — la estructura de roles/permisos se mantiene igual.
4. Configurar `ANTHROPIC_API_KEY` como secreto en el nuevo repo (mismo key sirve para todos los proyectos, es de tu cuenta de Anthropic, no del repo).
5. Listo — no hay que tocar nada más de Claude Code en sí, el mecanismo de subagentes es del CLI, no del proyecto.
