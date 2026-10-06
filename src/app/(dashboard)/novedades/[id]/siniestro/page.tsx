import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSiniestro, getSiniestroIdPorNovedad, type FotoSiniestro } from "@/app/api/actions/siniestros";
import { CompletarFotosSiniestro } from "@/components/novedades/completar-fotos-siniestro";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateShort } from "@/lib/utils";

export const metadata = { title: "Siniestro vial" };

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm font-medium">{valor || "—"}</dd>
    </div>
  );
}

function Galeria({ titulo, fotos, vacio }: { titulo: string; fotos: FotoSiniestro[]; vacio: string }) {
  return (
    <section aria-label={titulo} className="space-y-2">
      <h3 className="text-sm font-semibold">
        {titulo} ({fotos.length})
      </h3>
      {fotos.length === 0 ? (
        <p className="text-sm text-muted-foreground">{vacio}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {fotos.map((f, i) => (
            <li key={f.id}>
              {f.url ? (
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-md border">
                  {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada de Storage, caduca en 1 h */}
                  <img src={f.url} alt={`${titulo}, foto ${i + 1}`} className="aspect-square w-full object-cover" loading="lazy" />
                </a>
              ) : (
                <p className="rounded-md border p-2 text-xs text-muted-foreground">No se pudo cargar la foto {i + 1}.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** El parámetro es el id de la NOVEDAD: la tabla de novedades enlaza aquí sin saber el id del siniestro. */
export default async function SiniestroDeNovedadPage({ params }: { params: { id: string } }) {
  const incidentId = Number(params.id);
  if (!Number.isInteger(incidentId) || incidentId <= 0) notFound();
  const accidentId = await getSiniestroIdPorNovedad(incidentId);
  if (!accidentId) notFound();
  const r = await getSiniestro(accidentId);
  if ("error" in r) notFound();
  const { siniestro: s, fotos, resumen, puedeSubir } = r;

  return (
    <div className="space-y-6">
      <Link href="/novedades" className="inline-flex min-h-11 items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a novedades
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">Siniestro vial — {s.placa}</h1>
        <Badge variant={resumen.completo ? "success" : "destructive"}>{resumen.completo ? "Respaldo completo" : "Respaldo incompleto"}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hechos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Dato etiqueta="Fecha y hora" valor={formatDateShort(s.fechaHora)} />
            <Dato etiqueta="Lugar" valor={s.lugar} />
            <Dato etiqueta="Con paciente a bordo" valor={s.pacienteABordo ? "Sí" : "No"} />
            <Dato etiqueta="Lesionados" valor={s.hayLesionados ? s.lesionadosDetalle ?? "Sí" : "No"} />
            <Dato etiqueta="Intervino autoridad" valor={s.intervinoAutoridad ? `Sí${s.numeroIpat ? ` — IPAT ${s.numeroIpat}` : ""}` : "No"} />
            <Dato etiqueta="Ambulancia operativa" valor={s.vehiculoOperativo ? "Sí" : "No"} />
          </dl>
          <p className="text-sm">{s.descripcion}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Otro vehículo o persona implicada</CardTitle>
        </CardHeader>
        <CardContent>
          {s.hayTerceros ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              <Dato etiqueta="Placa" valor={s.tercero.placa} />
              <Dato etiqueta="Nombre" valor={s.tercero.nombre} />
              <Dato etiqueta="Cédula" valor={s.tercero.cedula} />
              <Dato etiqueta="Teléfono" valor={s.tercero.telefono} />
              <Dato etiqueta="Aseguradora" valor={s.tercero.aseguradora} />
            </dl>
          ) : (
            <Dato etiqueta="Sin tercero — motivo" valor={s.sinTerceroMotivo} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Abogado presente</CardTitle>
        </CardHeader>
        <CardContent>
          {s.sinAbogadoMotivo ? (
            <Dato etiqueta="No hubo abogado — motivo" valor={s.sinAbogadoMotivo} />
          ) : (
            <dl className="grid gap-3 sm:grid-cols-2">
              <Dato etiqueta="Nombre" valor={s.abogado.nombre} />
              <Dato etiqueta="Teléfono" valor={s.abogado.telefono} />
              <Dato etiqueta="Cédula" valor={s.abogado.cedula} />
              <Dato etiqueta="Correo" valor={s.abogado.correo} />
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fotos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {puedeSubir && !resumen.completo && <CompletarFotosSiniestro accidentId={s.id} resumen={resumen} />}
          <Galeria titulo="Fotos de los hechos" fotos={fotos.filter((f) => f.tipo === "HECHOS")} vacio="Sin fotos de los hechos." />
          {s.sinDocumentosMotivo ? (
            <Dato etiqueta="No se generaron documentos — motivo" valor={s.sinDocumentosMotivo} />
          ) : null}
          <Galeria
            titulo="Fotos de los documentos generados"
            fotos={fotos.filter((f) => f.tipo === "DOCUMENTOS")}
            vacio="Sin fotos de documentos."
          />
        </CardContent>
      </Card>
    </div>
  );
}
