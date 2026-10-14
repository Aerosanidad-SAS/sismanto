"use client";

import { useEffect, useState } from "react";
import { guardarDatosPersonales } from "@/app/api/actions/usuarios-datos";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RH_VALIDOS, type DatosPersonalesUsuario } from "@/lib/usuarios-sisres";
import { TIPOS_DOCUMENTO } from "@/lib/validations";

// Radix Select no admite value="": valor centinela para «sin dato».
const NINGUNO = "__ninguno__";

/**
 * Los campos de usuario que SISRES tenía y SISMANTO no: tipo de documento, nombres y apellidos por separado, fecha de
 * nacimiento, RH, celular y departamento. Se usan al crear un usuario y en «Datos personales» de cada fila.
 * Solo los ve y edita un ADMIN (son datos sensibles).
 */
export function CamposDatosPersonales({
  valores,
  onChange,
  prefijoId = "dp",
}: {
  valores: DatosPersonalesUsuario;
  onChange: (valores: DatosPersonalesUsuario) => void;
  prefijoId?: string;
}) {
  const set = <K extends keyof DatosPersonalesUsuario>(campo: K, valor: DatosPersonalesUsuario[K]) =>
    onChange({ ...valores, [campo]: valor });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${prefijoId}-primer-nombre`}>Primer nombre</Label>
          <Input id={`${prefijoId}-primer-nombre`} value={valores.primerNombre} onChange={(e) => set("primerNombre", e.target.value)} className="mt-1" autoComplete="off" />
        </div>
        <div>
          <Label htmlFor={`${prefijoId}-segundo-nombre`}>Segundo nombre</Label>
          <Input id={`${prefijoId}-segundo-nombre`} value={valores.segundoNombre} onChange={(e) => set("segundoNombre", e.target.value)} className="mt-1" autoComplete="off" />
        </div>
        <div>
          <Label htmlFor={`${prefijoId}-primer-apellido`}>Primer apellido</Label>
          <Input id={`${prefijoId}-primer-apellido`} value={valores.primerApellido} onChange={(e) => set("primerApellido", e.target.value)} className="mt-1" autoComplete="off" />
        </div>
        <div>
          <Label htmlFor={`${prefijoId}-segundo-apellido`}>Segundo apellido</Label>
          <Input id={`${prefijoId}-segundo-apellido`} value={valores.segundoApellido} onChange={(e) => set("segundoApellido", e.target.value)} className="mt-1" autoComplete="off" />
        </div>
      </div>

      <div>
        <Label>Tipo de documento</Label>
        <Select value={valores.tipoDocumento || NINGUNO} onValueChange={(v) => set("tipoDocumento", v === NINGUNO ? "" : v)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NINGUNO}>Sin dato</SelectItem>
            {TIPOS_DOCUMENTO.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${prefijoId}-nacimiento`}>Fecha de nacimiento</Label>
          <Input id={`${prefijoId}-nacimiento`} type="date" value={valores.fechaNacimiento} onChange={(e) => set("fechaNacimiento", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>RH</Label>
          <Select value={valores.rh || NINGUNO} onValueChange={(v) => set("rh", v === NINGUNO ? "" : v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NINGUNO}>Sin dato</SelectItem>
              {RH_VALIDOS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={`${prefijoId}-celular`}>Celular</Label>
          <Input id={`${prefijoId}-celular`} inputMode="tel" value={valores.celular} onChange={(e) => set("celular", e.target.value)} placeholder="3001234567" className="mt-1" autoComplete="off" />
        </div>
        <div>
          <Label htmlFor={`${prefijoId}-departamento`}>Departamento</Label>
          <Input id={`${prefijoId}-departamento`} value={valores.departamento} onChange={(e) => set("departamento", e.target.value)} placeholder="Antioquia" className="mt-1" autoComplete="off" />
        </div>
      </div>
    </div>
  );
}

/** «Datos personales» de un usuario que ya existe: se abre desde el menú de su fila. */
export function DialogDatosPersonales({
  usuario,
  inicial,
  onClose,
  onSaved,
}: {
  usuario: { user_id: string; nombre_completo: string | null; email: string | null } | null;
  inicial: DatosPersonalesUsuario;
  onClose: () => void;
  onSaved: (mensaje: string) => void;
}) {
  const [valores, setValores] = useState<DatosPersonalesUsuario>(inicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cada vez que se abre para otro usuario, arranca con los datos de ese usuario.
  useEffect(() => {
    setValores(inicial);
    setError(null);
  }, [usuario?.user_id, inicial]);

  const guardar = async () => {
    if (!usuario) return;
    setGuardando(true);
    setError(null);
    const r = await guardarDatosPersonales(usuario.user_id, valores);
    setGuardando(false);
    if ("error" in r) {
      setError(r.error);
      return;
    }
    onSaved(`Datos personales de ${usuario.nombre_completo || usuario.email || "el usuario"} guardados`);
  };

  return (
    <Dialog open={usuario !== null} onOpenChange={(abierto) => !abierto && !guardando && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Datos personales</DialogTitle>
          <DialogDescription>
            {usuario?.nombre_completo || usuario?.email}. Son los campos de usuario de SISRES; solo los ve el administrador.
          </DialogDescription>
        </DialogHeader>
        <CamposDatosPersonales valores={valores} onChange={setValores} prefijoId="dp-edit" />
        {error && <p className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
