import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { MantenimientoFiltrosForm } from "@/components/mantenimientos/mantenimiento-filtros";
import { MantenimientosTabla } from "@/components/mantenimientos/mantenimientos-tabla";
import { requireRole } from "@/app/api/actions/auth";

async function fetchCategorias() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("maintenance_categories")
      .select("id, nombre, grupo_padre")
      .eq("activo", true)
      .order("grupo_padre")
      .order("nombre");
    return (data || []) as { id: number; nombre: string; grupo_padre: string | null }[];
  } catch {
    return [];
  }
}

async function fetchMantenimientos(searchParams: {
  mPlaca?: string;
  mDesde?: string;
  mHasta?: string;
  mCat?: string;
  mTipo?: string;
  mProv?: string;
  mFac?: string;
}) {
  try {
    const supabase = createClient();
    let vehicleIdsFilter: string[] | null = null;
    const placaQ = searchParams.mPlaca?.trim();
    if (placaQ) {
      const { data: pv } = await supabase.from("vehicles").select("id").ilike("placa", `%${placaQ}%`);
      vehicleIdsFilter = (pv || []).map((v: { id: string }) => v.id);
      if (vehicleIdsFilter.length === 0) return [];
    }

    let categoriaIds: number[] | null = null;
    const catQ = searchParams.mCat?.trim();
    if (catQ) {
      const { data: cats } = await supabase.from("maintenance_categories").select("id").ilike("nombre", `%${catQ}%`);
      categoriaIds = (cats || []).map((c: { id: number }) => c.id);
      if (categoriaIds.length === 0) return [];
    }

    let q = supabase
      .from("maintenance_records")
      .select(
        `
        *,
        vehicles!inner(placa),
        maintenance_categories(nombre)
      `
      )
      .order("fecha", { ascending: false })
      .limit(600);

    if (vehicleIdsFilter) q = q.in("vehicle_id", vehicleIdsFilter);
    const desde = searchParams.mDesde?.trim();
    const hasta = searchParams.mHasta?.trim();
    if (desde) q = q.gte("fecha", desde);
    if (hasta) q = q.lte("fecha", hasta);
    const tipo = searchParams.mTipo?.trim();
    if (tipo === "PREVENTIVO" || tipo === "CORRECTIVO") q = q.eq("tipo", tipo);
    const prov = searchParams.mProv?.trim();
    if (prov) q = q.ilike("proveedor", `%${prov}%`);
    const fac = searchParams.mFac?.trim();
    if (fac) q = q.ilike("numero_factura", `%${fac}%`);
    if (categoriaIds) q = q.in("categoria_id", categoriaIds);

    const { data } = await q;
    return data || [];
  } catch {
    return [];
  }
}

export default async function MantenimientosPage({
  searchParams,
}: {
  searchParams: {
    mPlaca?: string;
    mDesde?: string;
    mHasta?: string;
    mCat?: string;
    mTipo?: string;
    mProv?: string;
    mFac?: string;
  };
}) {
  await requireRole(["ADMIN", "MANTENIMIENTO", "ANALISTA"]);
  const [mantenimientos, categories] = await Promise.all([
    fetchMantenimientos(searchParams),
    fetchCategorias(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl">Mantenimientos</h1>
          <p className="mt-2 text-muted-foreground">
            Historial completo — filtre por placa, fechas, categoría, tipo, proveedor y factura.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/mantenimientos/cargar-facturas">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Cargar Facturas
            </Button>
          </Link>
          <Link href="/mantenimientos/nuevo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Mantenimiento
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Mismos criterios que las columnas de la tabla inferior.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <MantenimientoFiltrosForm
            inicial={{
              placa: searchParams.mPlaca,
              desde: searchParams.mDesde,
              hasta: searchParams.mHasta,
              categoria: searchParams.mCat,
              tipo: searchParams.mTipo,
              proveedor: searchParams.mProv,
              factura: searchParams.mFac,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial ({mantenimientos.length} registros)</CardTitle>
          <CardDescription>
            Categoría, Tipo y Descripción son editables — haz clic sobre ellos para modificar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MantenimientosTabla
            mantenimientos={mantenimientos as any}
            categories={categories}
          />
        </CardContent>
      </Card>
    </div>
  );
}
