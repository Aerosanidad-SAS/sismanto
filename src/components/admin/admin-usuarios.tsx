"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { createUserAsAdmin, updateUserAsAdmin, toggleUserActive } from "@/app/api/actions/auth";
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
import { Plus, Pencil, Check, X } from "lucide-react";
import type { UserRole } from "@/app/api/actions/auth";
import { veSoloSuCentro } from "@/lib/auth-utils";
import { cn } from "@/lib/utils";

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

export function AdminUsuarios({ users, roles, centros }: AdminUsuariosProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nuevo, setNuevo] = useState<CamposPerfil>(PERFIL_VACIO);

  // Fila en edición en línea (user_id) — una a la vez.
  const [editando, setEditando] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<CamposPerfil>(PERFIL_VACIO);

  const nombreCentro = new Map(centros.map((c) => [c.id, c.nombre]));

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const result = await createUserAsAdmin({
      email,
      password,
      nombreCompleto: nuevo.nombreCompleto,
      cedula: nuevo.cedula,
      ciudad: nuevo.ciudad,
      operationalCenterId: aCentroId(nuevo.centroId),
      roleCodigo: nuevo.roleCodigo,
    });
    if (result?.error) setError(result.error);
    else {
      setSuccess("Usuario creado correctamente");
      setShowCreate(false);
      setEmail("");
      setPassword("");
      setNuevo(PERFIL_VACIO);
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Centro</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
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
                          className="h-8 w-40"
                          autoFocus
                        />
                      </TableCell>
                      <TableCell className="max-w-[12rem] truncate" title={u.email ?? undefined}>
                        {u.email || "—"}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={edicion.cedula}
                          onChange={(e) => setCampo("cedula", e.target.value)}
                          onKeyDown={teclas}
                          className="h-8 w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={edicion.ciudad}
                          onChange={(e) => setCampo("ciudad", e.target.value)}
                          onKeyDown={teclas}
                          className="h-8 w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={edicion.centroId} onValueChange={(v) => setCampo("centroId", v)}>
                          <SelectTrigger className="h-8 w-36">
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
                          <SelectTrigger className="h-8 w-40">
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
                      <TableCell className="text-right whitespace-nowrap">
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
                    <TableCell className="max-w-[12rem] truncate" title={u.email ?? undefined}>
                      {u.email || "—"}
                    </TableCell>
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
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => abrirEdicion(u)}
                        disabled={loading || editando !== null}
                        className="px-2"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(u.user_id, !u.activo)}
                        disabled={loading}
                        className={cn("px-2", u.activo ? "text-red-600" : "text-green-600")}
                      >
                        {u.activo ? "Deshabilitar" : "Habilitar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
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
