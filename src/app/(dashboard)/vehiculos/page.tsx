import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VehiculosTablaExpandible } from "@/components/vehiculos/vehiculos-tabla-expandible";

async function getVehicles() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .order("placa");

    return data || [];
  } catch {
    return [];
  }
}

export default async function VehiculosPage() {
  const vehicles = await getVehicles();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Vehículos</h1>
        <p className="mt-2 text-muted-foreground">Gestión de la flota de ambulancias</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vehículos</CardTitle>
          <CardDescription>
            Todos los vehículos registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Pulse la fila para desplegar opciones. En el detalle puede actualizar el kilometraje (obligatorio fecha y
            lectura).
          </p>
          <VehiculosTablaExpandible vehicles={vehicles} />
        </CardContent>
      </Card>
    </div>
  );
}
