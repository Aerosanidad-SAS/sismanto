"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { actualizarAerolinea, crearAerolinea, eliminarAerolinea } from "@/app/api/actions/aerolineas";
import type { AerolineaFila } from "@/app/api/actions/aerolineas";

export function AerolineasTabla({
  aerolineas,
  puedeAdministrar,
}: {
  aerolineas: AerolineaFila[];
  puedeAdministrar: boolean;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<AerolineaFila | null>(null);
  const [nombre, setNombre] = useState("");
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const abrirNueva = () => {
    setEditando(null);
    setNombre("");
    setActivo(true);
    setError(null);
    setAbierto(true);
  };

  const abrirEdicion = (a: AerolineaFila) => {
    setEditando(a);
    setNombre(a.nombre);
    setActivo(a.activo);
    setError(null);
    setAbierto(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const res = editando ? await actualizarAerolinea(editando.id, { nombre, activo }) : await crearAerolinea(nombre);
    setGuardando(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    setAbierto(false);
    router.refresh();
  };

  const desactivar = async (a: AerolineaFila) => {
    if (!confirm(`¿Desactivar la aerolínea ${a.nombre}? Dejará de aparecer al registrar valoraciones.`)) return;
    const res = await eliminarAerolinea(a.id);
    if ("error" in res && res.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {puedeAdministrar && (
        <div className="flex justify-end">
          <Button onClick={abrirNueva}>Nueva aerolínea</Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              {puedeAdministrar && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {aerolineas.length === 0 && (
              <TableRow>
                <TableCell colSpan={puedeAdministrar ? 3 : 2} className="text-center text-muted-foreground">
                  Todavía no hay aerolíneas.
                </TableCell>
              </TableRow>
            )}
            {aerolineas.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.nombre}</TableCell>
                <TableCell>
                  {a.activo ? <Badge variant="success">ACTIVO</Badge> : <Badge variant="destructive">INACTIVO</Badge>}
                </TableCell>
                {puedeAdministrar && (
                  <TableCell className="space-x-2 whitespace-nowrap text-right">
                    <Button variant="outline" size="sm" onClick={() => abrirEdicion(a)}>
                      Editar
                    </Button>
                    {a.activo && (
                      <Button variant="outline" size="sm" onClick={() => desactivar(a)}>
                        Desactivar
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar aerolínea" : "Nueva aerolínea"}</DialogTitle>
            <DialogDescription>El nombre debe ser único.</DialogDescription>
          </DialogHeader>
          <form onSubmit={guardar} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="aerolinea-nombre">Nombre *</Label>
              <Input id="aerolinea-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={150} />
            </div>
            {editando && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
                Activa
              </label>
            )}
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
