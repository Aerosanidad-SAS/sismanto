"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { createUserAsAdmin, updateUserAsAdmin, toggleUserActive, restablecerClaveUsuario } from "@/app/api/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Plus, Pencil, Check, X, KeyRound, MoreHorizontal, UserX, UserCheck, Contact, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { UserRole } from "@/app/api/actions/auth";
import { veSoloSuCentro } from "@/lib/auth-utils";
import { cn } from "@/lib/utils";
import { CamposDatosPersonales, DialogDatosPersonales } from "@/components/admin/datos-personales-usuario";
import {
  filtrarYOrdenar,
  hayFiltrosUsuarios,
  siguienteOrden,
  type ColumnaUsuario,
  type FiltrosColumna,
  type OrdenUsuarios,
} from "@/lib/usuarios-tabla";
import { DATOS_PERSONALES_VACIOS, nombreCompletoDe, type DatosPersonalesUsuario } from "@/lib/usuarios-sisres";

// Radix Select no admite value="" — valor centinela para "sin centro".
const SIN_CENTRO = "__none__";

interface Usuario {
  id: number;
  user_id: string;
  nombre_completo: string | null;
  email: string | null;
  cedula: string | null;
  ciudad: string | null;
  operational_center_id: number | null;
  activo: boolean;
  role_codigo: string;
  role_nombre: string;
}

interface AdminUsuariosProps {
  users: Usuario[];
  roles: { id: number; codigo: string; nombre: string }[];
  centros: { id: number; nombre: string }[];
  /** Datos personales de SISRES por `user_id` (solo se cargan para un ADMIN). */
  extras?: Record<string, DatosPersonalesUsuario>;
  /** Solo un ADMIN ve y edita los datos personales: RH, nacimiento y celular son sensibles. */
  puedeDatosPersonales?: boolean;
}

interface CamposPerfil {
  nombreCompleto: string;
  cedula: string;
  ciudad: string;
  centroId: string;
  roleCodigo: UserRole;
}

const PERFIL_VACIO: CamposPerfil = {
  nombreCompleto: "",
  cedula: "",
  ciudad: "",
  centroId: SIN_CENTRO,
  roleCodigo: "OVEM",
};

function aCentroId(centroId: string): number | null {
  return centroId === SIN_CENTRO ? null : Number(centroId);
}

/** Campos comunes a "Crear usuario" y "Editar usuario". */
function CamposPerfilUsuario({
  valores,
  onChange,
  roles,
  centros,
}: {
  valores: CamposPerfil;
  onChange: (valores: CamposPerfil) => void;
  roles: AdminUsuariosProps["roles"];
  centros: AdminUsuariosProps["centros"];
}) {
  const set = <K extends keyof CamposPerfil>(campo: K, valor: CamposPerfil[K]) =>
    onChange({ ...valores, [campo]: valor });

  return (
    <>
      <div>
        <Label>Nombre completo</Label>
        <Input
          value={valores.nombreCompleto}
          onChange={(e) => set("nombreCompleto", e.target.value)}
          placeholder="Juan Pérez"
          className="mt-1"
        />
      </div>
      <div>
        <Label>Cédula</Label>
        <Input
          value={valores.cedula}
          onChange={(e) => set("cedula", e.target.value)}
          placeholder="Documento de identidad"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Con la cédula el usuario también puede iniciar sesión, igual que en SISRES.
        </p>
      </div>
      <div>
        <Label>Ciudad</Label>
        <Input
          value={valores.ciudad}
          onChange={(e) => set("ciudad", e.target.value)}
          placeholder="Bogotá"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Ciudad de origen por defecto al crear servicios.
        </p>
      </div>
      <div>
        <Label>Centro operativo</Label>
        <Select value={valores.centroId} onValueChange={(v) => set("centroId", v)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SIN_CENTRO}>Sin centro</SelectItem>
            {centros.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 text-xs text-muted-foreground">
          Regulación, OVEM, médico y auxiliar ven solo la operación de su centro. Sin centro ven
          todos.
        </p>
      </div>
      <div>
        <Label>Rol *</Label>
        <Select value={valores.roleCodigo} onValueChange={(v) => set("roleCodigo", v as UserRole)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.codigo}>
                {r.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

export function AdminUsuarios({ users, roles, centros, extras = {}, puedeDatosPersonales = false }: AdminUsuariosProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nuevo, setNuevo] = useState<CamposPerfil>(PERFIL_VACIO);
  const [datosNuevo, setDatosNuevo] = useState<DatosPersonalesUsuario>(DATOS_PERSONALES_VACIOS);
  // «Datos personales» de un usuario existente (diálogo aparte, solo ADMIN).
  const [datosDe, setDatosDe] = useState<Usuario | null>(null);

  // Fila en edición en línea (user_id) — una a la vez.
  const [editando, setEditando] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<CamposPerfil>(PERFIL_VACIO);

  // Restablecer clave: primero se confirma y luego se muestra la clave temporal (una sola vez).
  const [reseteo, setReseteo] = useState<{ usuario: Usuario; clave: string | null } | null>(null);

  const nombreCentro = new Map(centros.map((c) => [c.id, c.nombre]));

  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState<FiltrosColumna>({});
  const [orden, setOrden] = useState<OrdenUsuarios | null>(null);
  const hayFiltros = hayFiltrosUsuarios(busqueda, filtros);

  // Se busca, filtra y ordena sobre el texto que la tabla muestra (el centro sin asignar se lee «Sin centro» o «Todos»).
  const visibles = useMemo(() => {
    const filas = users.map((u) => ({
      u,
      texto: {
        nombre: u.nombre_completo ?? "",
        email: u.email ?? "",
        cedula: u.cedula ?? "",
        ciudad: u.ciudad ?? "",
        centro: (u.operational_center_id ? nombreCentro.get(u.operational_center_id) : null) ?? (veSoloSuCentro(u.role_codigo) ? "Sin centro" : "Todos"),
        rol: u.role_nombre || u.role_codigo,
        estado: u.activo ? "Activo" : "Deshabilitado",
      },
    }));
    const res = filtrarYOrdenar(filas, busqueda, filtros, orden);
    // La fila en edición no se oculta aunque deje de cumplir los filtros: así Guardar/Cancelar siempre se ven.
    return editando && !res.some((f) => f.u.user_id === editando)
      ? [...filas.filter((f) => f.u.user_id === editando), ...res]
      : res;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nombreCentro se rehace en cada render a partir de `centros`
  }, [users, centros, busqueda, filtros, orden, editando]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltros({});
  };

  const COLUMNAS: { clave: ColumnaUsuario; titulo: string }[] = [
    { clave: "nombre", titulo: "Nombre" },
    { clave: "email", titulo: "Email" },
    { clave: "cedula", titulo: "Cédula" },
    { clave: "ciudad", titulo: "Ciudad" },
    { clave: "centro", titulo: "Centro" },
    { clave: "rol", titulo: "Rol" },
    { clave: "estado", titulo: "Estado" },
  ];

  const handleRestablecer = async () => {
    if (!reseteo) return;
    setLoading(true);
    setError(null);
    const result = await restablecerClaveUsuario(reseteo.usuario.user_id);
    if ("error" in result && result.error) {
      setError(result.error);
      setReseteo(null);
    } else if ("claveTemporal" in result && result.claveTemporal) {
      setReseteo({ usuario: reseteo.usuario, clave: result.claveTemporal });
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    // Con primer nombre y primer apellido, el nombre completo sale de las cuatro partes (como en SISRES).
    const nombreDePartes =
      puedeDatosPersonales && datosNuevo.primerNombre.trim() && datosNuevo.primerApellido.trim() ? nombreCompletoDe(datosNuevo) : "";
    const result = await createUserAsAdmin({
      email,
      password,
      nombreCompleto: nombreDePartes || nuevo.nombreCompleto,
      cedula: nuevo.cedula,
      ciudad: nuevo.ciudad,
      operationalCenterId: aCentroId(nuevo.centroId),
      roleCodigo: nuevo.roleCodigo,
      datosPersonales: puedeDatosPersonales ? datosNuevo : undefined,
    });
    if (result?.error) setError(result.error);
    else {
      setSuccess("Usuario creado correctamente");
      setShowCreate(false);
      setEmail("");
      setPassword("");
      setNuevo(PERFIL_VACIO);
      setDatosNuevo(DATOS_PERSONALES_VACIOS);
      router.refresh();
    }
    setLoading(false);
  };

  const abrirEdicion = (u: Usuario) => {
    setError(null);
    setSuccess(null);
    setEdicion({
      nombreCompleto: u.nombre_completo ?? "",
      cedula: u.cedula ?? "",
      ciudad: u.ciudad ?? "",
      centroId: u.operational_center_id ? String(u.operational_center_id) : SIN_CENTRO,
      roleCodigo: u.role_codigo as UserRole,
    });
    setEditando(u.user_id);
  };

  const setCampo = <K extends keyof CamposPerfil>(campo: K, valor: CamposPerfil[K]) =>
    setEdicion((prev) => ({ ...prev, [campo]: valor }));

  const handleSaveEdit = async () => {
    if (!editando || !edicion.nombreCompleto.trim()) return;
    const usuario = users.find((u) => u.user_id === editando);
    setLoading(true);
    setError(null);
    const result = await updateUserAsAdmin({
      userId: editando,
      nombreCompleto: edicion.nombreCompleto,
      cedula: edicion.cedula,
      ciudad: edicion.ciudad,
      operationalCenterId: aCentroId(edicion.centroId),
      roleCodigo: edicion.roleCodigo,
    });
    if (result?.error) setError(result.error);
    else {
      setSuccess(`Usuario ${usuario?.email ?? ""} actualizado`);
      setEditando(null);
      router.refresh();
    }
    setLoading(false);
  };

  const handleToggleActive = async (userId: string, activo: boolean) => {
    setLoading(true);
    setError(null);
    const result = await toggleUserActive(userId, activo);
    if (result?.error) setError(result.error);
    else router.refresh();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Lista de usuarios del sistema</CardDescription>
          </div>
          <Button onClick={() => setShowCreate(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Crear usuario
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              {success}
            </div>
          )}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1 basis-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre, correo, cédula o rol"
                aria-label="Buscar usuarios por nombre, correo, cédula o rol"
                className="h-touch pl-9"
              />
            </div>
            <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
              {hayFiltros ? `${visibles.length} de ${users.length} usuarios` : `${users.length} usuarios`}
            </p>
            {hayFiltros && (
              <Button variant="outline" onClick={limpiarFiltros} className="min-h-touch">
                <X className="mr-2 h-4 w-4" aria-hidden="true" />
                Limpiar filtros
              </Button>
            )}
          </div>
          {/* Cada columna mide lo que mide su contenido más largo (nada se corta ni se trunca); si no cabe en la pantalla, la tabla se desplaza en horizontal y «Acciones» queda fija a la derecha. */}
          <Table className="min-w-max whitespace-nowrap">
            <TableHeader>
              <TableRow>
                {COLUMNAS.map(({ clave, titulo }) => {
                  const activa = orden?.columna === clave ? orden.dir : null;
                  const Icono = activa === "asc" ? ArrowUp : activa === "desc" ? ArrowDown : ArrowUpDown;
                  return (
                    <TableHead key={clave} aria-sort={activa === "asc" ? "ascending" : activa === "desc" ? "descending" : undefined} className="p-0">
                      <button
                        type="button"
                        onClick={() => setOrden(siguienteOrden(orden, clave))}
                        className="flex h-touch w-full items-center gap-1.5 px-4 text-left uppercase tracking-wide hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      >
                        {titulo}
                        <Icono className={cn("h-3.5 w-3.5 shrink-0", !activa && "opacity-40")} aria-hidden="true" />
                      </button>
                    </TableHead>
                  );
                })}
                <TableHead className="sticky right-0 bg-muted text-right">Acciones</TableHead>
              </TableRow>
              <TableRow>
                {COLUMNAS.map(({ clave, titulo }) => (
                  <TableCell key={clave} className="px-2 py-1">
                    <Input
                      type="search"
                      value={filtros[clave] ?? ""}
                      onChange={(e) => setFiltros((prev) => ({ ...prev, [clave]: e.target.value }))}
                      aria-label={`Filtrar por ${titulo.toLowerCase()}`}
                      placeholder="Filtrar"
                      className="h-touch min-w-[7rem] text-sm font-normal normal-case tracking-normal"
                    />
                  </TableCell>
                ))}
                <TableCell className="sticky right-0 bg-muted p-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={COLUMNAS.length + 1} className="py-8 text-center text-muted-foreground">
                    Ningún usuario coincide con la búsqueda o los filtros.
                  </TableCell>
                </TableRow>
              )}
              {visibles.map(({ u }) => {
                const centro = u.operational_center_id ? nombreCentro.get(u.operational_center_id) : null;
                if (editando === u.user_id) {
                  // Enter guarda y Escape cancela desde los campos de texto (no desde
                  // los Select: su lista usa esas teclas para navegar).
                  const teclas = (e: KeyboardEvent) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") setEditando(null);
                  };
                  return (
                    <TableRow key={u.user_id} className="bg-muted/40">
                      <TableCell>
                        <Input
                          value={edicion.nombreCompleto}
                          onChange={(e) => setCampo("nombreCompleto", e.target.value)}
                          onKeyDown={teclas}
                          className="h-8 w-56"
                          autoFocus
                        />
                      </TableCell>
                      <TableCell>{u.email || "—"}</TableCell>
                      <TableCell>
                        <Input
                          value={edicion.cedula}
                          onChange={(e) => setCampo("cedula", e.target.value)}
                          onKeyDown={teclas}
                          className="h-8 w-36"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={edicion.ciudad}
                          onChange={(e) => setCampo("ciudad", e.target.value)}
                          onKeyDown={teclas}
                          className="h-8 w-36"
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={edicion.centroId} onValueChange={(v) => setCampo("centroId", v)}>
                          <SelectTrigger className="h-8 w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={SIN_CENTRO}>Sin centro</SelectItem>
                            {centros.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={edicion.roleCodigo}
                          onValueChange={(v) => setCampo("roleCodigo", v as UserRole)}
                        >
                          <SelectTrigger className="h-8 w-52">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((r) => (
                              <SelectItem key={r.id} value={r.codigo}>
                                {r.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.activo ? "success" : "secondary"}>
                          {u.activo ? "Activo" : "Deshabilitado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="sticky right-0 bg-muted text-right">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={loading || !edicion.nombreCompleto.trim()}
                          className="px-2"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          {loading ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditando(null)}
                          disabled={loading}
                          className="px-2"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }

                return (
                  <TableRow key={u.user_id}>
                    <TableCell className="font-medium">{u.nombre_completo || "—"}</TableCell>
                    <TableCell>{u.email || "—"}</TableCell>
                    <TableCell>{u.cedula || "—"}</TableCell>
                    <TableCell>{u.ciudad || "—"}</TableCell>
                    <TableCell>
                      {centro ? (
                        centro
                      ) : veSoloSuCentro(u.role_codigo) ? (
                        <Badge
                          variant="warning"
                          title="Sin centro: este usuario ve la operación de todos los centros"
                        >
                          Sin centro
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Todos</span>
                      )}
                    </TableCell>
                    <TableCell>{u.role_nombre || u.role_codigo}</TableCell>
                    <TableCell>
                      <Badge variant={u.activo ? "success" : "secondary"}>
                        {u.activo ? "Activo" : "Deshabilitado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="sticky right-0 bg-card text-right">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger
                          aria-label={`Acciones de ${u.nombre_completo || u.email || "usuario"}`}
                          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-2.5 text-sm text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            align="end"
                            sideOffset={4}
                            className="z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
                          >
                            <DropdownMenu.Item
                              disabled={loading || editando !== null}
                              onSelect={() => abrirEdicion(u)}
                              className="flex min-h-touch cursor-pointer select-none items-center gap-2 rounded-sm px-3 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              Editar datos
                            </DropdownMenu.Item>
                            {puedeDatosPersonales && (
                              <DropdownMenu.Item
                                disabled={loading || editando !== null}
                                onSelect={() => setDatosDe(u)}
                                className="flex min-h-touch cursor-pointer select-none items-center gap-2 rounded-sm px-3 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                              >
                                <Contact className="h-4 w-4" aria-hidden="true" />
                                Datos personales
                              </DropdownMenu.Item>
                            )}
                            <DropdownMenu.Item
                              disabled={loading || editando !== null}
                              onSelect={() => setReseteo({ usuario: u, clave: null })}
                              className="flex min-h-touch cursor-pointer select-none items-center gap-2 rounded-sm px-3 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                              <KeyRound className="h-4 w-4" aria-hidden="true" />
                              Restablecer clave
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="my-1 h-px bg-border" />
                            <DropdownMenu.Item
                              disabled={loading}
                              onSelect={() => handleToggleActive(u.user_id, !u.activo)}
                              className={cn(
                                "flex min-h-touch cursor-pointer select-none items-center gap-2 rounded-sm px-3 text-sm font-medium outline-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                u.activo ? "text-destructive focus:text-destructive" : "text-green-700 focus:text-green-700"
                              )}
                            >
                              {u.activo ? <UserX className="h-4 w-4" aria-hidden="true" /> : <UserCheck className="h-4 w-4" aria-hidden="true" />}
                              {u.activo ? "Deshabilitar" : "Habilitar"}
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={reseteo !== null} onOpenChange={(abierto) => !abierto && setReseteo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restablecer clave</DialogTitle>
          </DialogHeader>
          {reseteo && !reseteo.clave && (
            <div className="space-y-4">
              <p className="text-sm">
                Se le pondrá una clave temporal a <strong>{reseteo.usuario.nombre_completo || reseteo.usuario.email}</strong>. La que tenía deja de
                servir y el sistema le pedirá elegir una nueva al entrar.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setReseteo(null)} disabled={loading}>
                  Cancelar
                </Button>
                <Button onClick={handleRestablecer} disabled={loading}>
                  {loading ? "Restableciendo..." : "Restablecer"}
                </Button>
              </div>
            </div>
          )}
          {reseteo?.clave && (
            <div className="space-y-4">
              <p className="text-sm">
                Clave temporal de <strong>{reseteo.usuario.nombre_completo || reseteo.usuario.email}</strong>. Solo se muestra ahora: anótala y
                entrégasela por un canal privado.
              </p>
              <p className="select-all rounded-md border bg-muted px-3 py-2 text-center font-mono text-xl tracking-wider">{reseteo.clave}</p>
              <p className="text-xs text-muted-foreground">
                Entra con {reseteo.usuario.cedula ? `su cédula (${reseteo.usuario.cedula})` : "su correo"} y esta clave; el sistema le pedirá una nueva
                clave propia.
              </p>
              <div className="flex justify-end">
                <Button onClick={() => setReseteo(null)}>Listo</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DialogDatosPersonales
        usuario={datosDe}
        inicial={datosDe ? extras[datosDe.user_id] ?? DATOS_PERSONALES_VACIOS : DATOS_PERSONALES_VACIOS}
        onClose={() => setDatosDe(null)}
        onSaved={(mensaje) => {
          setDatosDe(null);
          setSuccess(mensaje);
          router.refresh();
        }}
      />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear usuario</DialogTitle>
            <p className="text-sm text-gray-500">
              Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Contraseña *</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="mt-1"
              />
            </div>
            <CamposPerfilUsuario valores={nuevo} onChange={setNuevo} roles={roles} centros={centros} />
            {puedeDatosPersonales && (
              <fieldset className="space-y-3 rounded-md border p-3">
                <legend className="px-1 text-sm font-medium">Datos personales (de SISRES)</legend>
                <p className="text-xs text-muted-foreground">
                  Opcionales. Con primer nombre y primer apellido, el nombre completo se arma con las cuatro partes. Solo el
                  administrador los ve.
                </p>
                <CamposDatosPersonales valores={datosNuevo} onChange={setDatosNuevo} prefijoId="dp-nuevo" />
              </fieldset>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={!email || !password || loading}>
                {loading ? "Creando..." : "Crear usuario"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
