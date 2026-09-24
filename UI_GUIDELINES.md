# Guía de UI/UX — módulos migrados de SISRES

**Objetivo:** todo lo que se porte de SISRES tiene que verse, sentirse y comportarse como el resto de Aeromanto. Un usuario que hoy usa Vehículos o Mantenimientos no debería notar ningún salto visual al entrar al módulo de Servicios o Pacientes. Nada de Bootstrap, jQuery ni SweetAlert2 sobrevive al port — eso es exactamente lo que ya migramos una vez (ver `AUDIT_sisres.md` §7: SISRES mismo tuvo que sacar Tailwind mezclado con Bootstrap por este mismo problema, no lo repitamos al revés).

## 1. Design tokens — usar los que ya existen, no inventar nuevos

Definidos en `src/app/globals.css` y expuestos como clases Tailwind vía `tailwind.config.ts`:

| Token Tailwind | Uso |
|---|---|
| `bg-background` / `text-foreground` | Fondo y texto base de cualquier página |
| `bg-card` / `text-card-foreground` | Tarjetas, paneles |
| `bg-primary` / `text-primary-foreground` | Acciones principales, links, `h1` (color primary automático) |
| `bg-secondary`, `bg-muted`, `bg-accent` | Texto secundario, fondos sutiles, énfasis |
| `bg-destructive` | Acciones destructivas (eliminar, cancelar) — **no** usar rojo genérico de Bootstrap |
| `border-border`, `ring-ring` | Bordes y focus rings — no hardcodear `border-gray-300` ni similares |

El color primario es un teal (`hsl(187 65% 48%)`) — si algo de SISRES traía su propia paleta corporativa (`--sis-primary: #1B6368`, `--sis-accent: #2BB6C7`, ver `AUDIT_sisres.md` §7), **se descarta**, no se mezcla. Un solo sistema de color.

Hay modo oscuro ya definido (`.dark` en `globals.css`) — cualquier componente nuevo tiene que funcionar en ambos, no asumir fondo claro.

## 2. Componentes — reusar `src/components/ui/`, no traer nada de SISRES

Ya existen (shadcn/ui sobre Radix): `alert-dialog`, `alert`, `badge`, `button`, `card`, `checkbox`, `command`, `dialog`, `input`, `label`, `popover`, `radio-group`, `select`, `table`, `tabs`, `textarea`, `tooltip`.

| Necesidad en SISRES (hoy) | Equivalente en Aeromanto (usar este) |
|---|---|
| SweetAlert2 (`swalHelper.php`, confirmaciones/alertas) | `alert-dialog.tsx` para confirmaciones destructivas; `alert.tsx` para mensajes inline |
| Modales Bootstrap | `dialog.tsx` |
| Tablas con cabecera fija (`.thead-aero`/`.encabezado-fijo`) | `table.tsx` + Tailwind (`sticky top-0`) — mismo resultado visual, sin CSS custom nuevo |
| Selects dependientes (departamento→ciudad, cascada) | `select.tsx` + Server Actions, mismo patrón que ya usa `vehiculos-tab`/`centros-tab` en Configuración |
| Botones con spinner de carga (`loading.js`) | Estado `pending` de React (`useFormStatus`/`useTransition`) + `button.tsx` con estado disabled — no un helper JS aparte |
| Iconos (ninguno consistente en SISRES) | `lucide-react` (ya es dependencia) |

**Si un módulo necesita un componente que no existe todavía** (ej. un componente de firma digital para valoraciones, o un visor de checklist tipo el de Mantenimiento Biomédico), se construye siguiendo el mismo patrón (Radix primitive + Tailwind + `cva`/`class-variance-authority`, que ya es dependencia) — no se resuelve con una librería nueva sin evaluarla primero (regla existente en `CLAUDE.md`: "No unreviewed deps").

## 3. Layout y navegación

- Todo módulo nuevo vive dentro del route group `(dashboard)` (`src/app/(dashboard)/<modulo>/`), con el sidebar dinámico por rol que ya existe — no se crea un layout paralelo.
- El sidebar filtra ítems por rol vía el arreglo `ALL_NAV` en `src/app/(dashboard)/layout.tsx` (ver `PRD.md` §6) — cada módulo nuevo se agrega ahí, no como un menú aparte.
- **Nada de navbar superior tipo SISRES** (`navegacion.php`) — un solo patrón de navegación en toda la app, el que ya existe.
- Formularios: React Hook Form + Zod + `@hookform/resolvers`, igual que `maintenance-form`/`vehicle-form` — los formularios condicionales de Servicios (que en PHP se resolvían con `ocultarCampos.js`/`ajustarCamposEditar()`) se resuelven con estado de React + `watch()` de RHF, no con jQuery mostrando/ocultando DOM.

## 4. Qué NO se porta nunca, aunque exista en SISRES

- Bootstrap, jQuery, SweetAlert2, Chart.js (→ usar Recharts, ya es dependencia), Leaflet se evalúa aparte solo si se porta GPS (mismo criterio: buscar si hay un equivalente React mantenido antes de traer la librería vieja tal cual).
- CSS a mano fuera de Tailwind (`custom.css`, `tokens.css` de SISRES) — cero CSS custom nuevo salvo casos que Tailwind no resuelva, y ahí como último recurso, documentando por qué.
- Iconos con emoji en texto (SISRES los usa harto: "🖨️ Imprimir", "📊 Etapas") — usar `lucide-react` con label accesible, no emoji en el copy.

## 5. Responsabilidad

León arranca los módulos de Pacientes/Servicios/Notificaciones — si en algún punto no está claro qué componente de `src/components/ui/` corresponde a algo de SISRES que no tiene equivalente directo, se pregunta antes de improvisar un patrón nuevo. Consistencia visual pesa más que velocidad en esta fase — un módulo que "se ve distinto" es la señal más rápida para un usuario de que algo salió mal en la migración, incluso si funciona bien.
