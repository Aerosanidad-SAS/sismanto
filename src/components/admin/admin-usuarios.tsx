"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserAsAdmin,
  updateUserRole,
  toggleUserActive,
} from "@/app/api/actions/auth";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { UserRole } from "@/app/api/actions/auth";

interface AdminUsuariosProps {
  users: {
    id: number;
    user_id: string;
    nombre_completo: string | null;
    email: string | null;
    cedula: string | null;
    activo: boolean;
    role_codigo: string;
    role_nombre: string;
  }[];
  roles: { id: number; codigo: string; nombre: string }[];
}

export function AdminUsuarios({ users, roles }: AdminUsuariosProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [cedula, setCedula] = useState("");
  const [roleCodigo, setRoleCodigo] = useState<UserRole>("OVEM");

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const result = await createUserAsAdmin({
      email,
      password,
      nombreCompleto,
      cedula,
      roleCodigo,
    });
    if (result?.error) setError(result.error);
    else {
      setSuccess("Usuario creado correctamente");
      setShowCreate(false);
      setEmail("");
      setPassword("");
      setNombreCompleto("");
      setCedula("");
      setRoleCodigo("OVEM");
      router.refresh();
    }
    setLoading(false);
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    setLoading(true);
    setError(null);
    const result = await updateUserRole(userId, newRole);
    if (result?.error) setError(result.error);
    else router.refresh();
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
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell className="font-medium">{u.nombre_completo || "—"}</TableCell>
                  <TableCell>{u.email || "—"}</TableCell>
                  <TableCell>{u.cedula || "—"}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role_codigo}
                      onValueChange={(v) => handleUpdateRole(u.user_id, v as UserRole)}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-40">
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
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(u.user_id, !u.activo)}
                      disabled={loading}
                      className={!u.activo ? "text-green-600" : "text-red-600"}
                    >
                      {u.activo ? "Deshabilitar" : "Habilitar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
                placeholder="Mínimo 6 caracteres"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Nombre completo</Label>
              <Input
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                placeholder="Juan Pérez"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Cédula</Label>
              <Input
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Documento de identidad"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Identifica al usuario si también existe en SISRES — permite cruzar cuentas por
                cédula en vez de por nombre.
              </p>
            </div>
            <div>
              <Label>Rol *</Label>
              <Select value={roleCodigo} onValueChange={(v) => setRoleCodigo(v as UserRole)}>
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!email || !password || loading}
              >
                {loading ? "Creando..." : "Crear usuario"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
