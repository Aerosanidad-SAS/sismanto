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

## 6. Componentes de formulario y feedback

Auditoría UX/UI (`AUDITORIA_UX_UI.md`, sección d). Todos en `src/components/ui/`, sobre Radix/cva, sin dependencias nuevas. Dependen de los tokens `success/warning/info(-soft)` y `touch` (PR #164).

### Reglas

- **Texto:** piso de 12 px (`text-xs`) para etiquetas y badges; 14 px (`text-sm`) para acciones y texto que se lee para decidir. Nada de `text-[10px]`.
- **Objetivo táctil:** 44 px (`min-h-touch`, `h-touch w-touch`, `Button size="touch"`) en OVEM y móvil; nunca menos de 24 px.
- **Nada solo por color:** todo estado lleva icono y texto (`StatusBadge`), todo error lleva texto (`FormError`).
- **Todo control con `Field`:** nada de `<Label>` suelto ni `<p className="text-red-600">`.
- **Tuteo** en el copy de la app interna («Selecciona», «Revisa»); cero emoji (usa `lucide-react` con texto accesible).
- **Colores solo con tokens** (`bg-success-soft`, `text-destructive`…), nunca `bg-green-600` ni hex.
- **Sin `alert()`/`confirm()`:** usa `useConfirm()` y `toast()`.

### Ejemplos

**`Field`** — etiqueta, ayuda y error enlazados (`id`, `aria-describedby`, `aria-invalid`). Con un `Select` de Radix usa la función para pasar las props al trigger.

```tsx
<Field label="Placa" required hint="Sin espacios ni guiones" error={errors.placa?.message}>
  <Input {...register("placa")} />
</Field>
<Field label="Vehículo" required error={errors.vehiculo?.message}>
  {(p) => (<Select onValueChange={setVehiculo}><SelectTrigger {...p}><SelectValue /></SelectTrigger>{/* items */}</Select>)}
</Field>
```

**`FormError`** — mensaje suelto con `role="alert"` (errores de acción dentro de un diálogo, no tras el overlay).

```tsx
<DialogContent>
  {/* campos */}
  <FormError>{serverError}</FormError>
</DialogContent>
```

**`StatusBadge`** — `tone`: `success | warning | danger | info | neutral`; icono por defecto según el tono.

```tsx
<StatusBadge tone="success">Operativo</StatusBadge>
<StatusBadge tone="danger" icon={Wrench}>Fuera de servicio</StatusBadge>
<StatusBadge tone="warning">Sin asignar</StatusBadge>
```

**`useConfirm()` / `ConfirmDialog`** — promesa booleana sobre `alert-dialog`. Renderiza `dialog` una vez en el componente.

```tsx
const { confirm, dialog } = useConfirm();
const ok = await confirm({ title: "¿Marcar fuera de servicio?", description: "Saldrá de la programación de hoy.", destructive: true, confirmLabel: "Marcar" });
if (!ok) return;
return (<>{/* UI */}{dialog}</>);
```

**`Toaster` / `toast()`** — el `Toaster` ya está montado en `app/layout.tsx`. Llama `toast` desde código cliente; «Deshacer» cierra el aviso al pulsarlo.

```tsx
toast.success("Servicio guardado");
toast.error("No pudimos asignar la tripulación", { description: result.error });
toast({ title: "Vehículo en FDS", tone: "warning", action: { label: "Deshacer", onClick: revert } });
```

**`FileDrop`** — zona de arrastre con input real; valida tipo y tamaño y muestra nombre, peso y error.

```tsx
<Field label="Hoja de vida (Excel)" required>
  {(p) => <FileDrop {...p} file={file} onFileChange={setFile} accept=".xlsx,.xls" maxBytes={5 * 1024 * 1024} helper="Excel, máximo 5 MB" />}
</Field>
```

**`EmptyState`** — vacío con una acción.

```tsx
<EmptyState icon={Truck} title="Aún no hay vehículos" description="Crea el primero para empezar." action={<Button>Crear vehículo</Button>} />
```

**`ErrorState`** — fallo de carga con salida (`error.tsx` pasa `reset`).

```tsx
<ErrorState title="No pudimos cargar los servicios" onRetry={reset} />
```

**`Skeleton` / `SkeletonRegion`** — esqueleto en `loading.tsx`; la región anuncia «Cargando…» una vez.

```tsx
<SkeletonRegion className="space-y-3"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></SkeletonRegion>
```

**`StatTile`** — una métrica (sustituye contadores y tarjetas ad hoc); con `href` es un enlace.

```tsx
<StatTile label="Sin asignar" value={3} tone="warning" icon={AlertTriangle} hint="Actualizado 14:32" href="/servicios?estado=sin-asignar" />
```

**`SegmentedControl`** — filtro de una sola opción como `radiogroup` (flechas, Home/End, un solo tab stop).

```tsx
<SegmentedControl aria-label="Servicios a mostrar" value={filtro} onValueChange={setFiltro}
  options={[{ value: "abiertos", label: "Abiertos" }, { value: "todos", label: "Todos hoy" }]} />
```

**`ResponsiveTable`** — tabla desde `md`; tarjetas con las columnas clave y menú «⋯» por debajo.

```tsx
<ResponsiveTable caption="Vehículos" rows={vehiculos} getRowId={(v) => v.id} empty={<EmptyState title="Sin vehículos" />}
  columns={[{ key: "placa", header: "Placa", rowHeader: true, cell: (v) => v.placa }, { key: "estado", header: "Estado", cell: (v) => <StatusBadge tone="success">{v.estado}</StatusBadge> }]}
  actions={(v) => [{ label: "Editar", onSelect: editar }, { label: "Eliminar", destructive: true, onSelect: eliminar }]}
  actionsLabel={(v) => `Acciones de ${v.placa}`} />
```
