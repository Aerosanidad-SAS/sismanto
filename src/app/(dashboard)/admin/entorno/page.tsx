import { requireRole } from "@/app/api/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { diagnosticarEntorno, type EstadoVariable, type Veredicto } from "@/lib/entorno-diagnostico";

export const metadata = { title: "Estado del entorno" };
// Se lee en cada visita: tiene que reflejar el despliegue que se está mirando, no el de la construcción.
export const dynamic = "force-dynamic";

const TEXTO_ESTADO: Record<EstadoVariable, string> = { con_valor: "Con valor", vacia: "Vacía", falta: "No existe" };

const VEREDICTO: Record<Veredicto, { texto: string; variante: "success" | "destructive" | "warning" | "secondary" }> = {
  bien: { texto: "Bien", variante: "success" },
  falta: { texto: "Falta", variante: "destructive" },
  revisar: { texto: "Revisar: comillas o espacios al borde", variante: "warning" },
  opcional_sin_poner: { texto: "Sin poner (opcional)", variante: "secondary" },
  sobra: { texto: "Definida: solo para pruebas", variante: "warning" },
};

const ETIQUETA_ENTORNO: Record<string, string> = {
  production: "Producción",
  preview: "Pruebas (dev o staging)",
  development: "Desarrollo local",
};

export default async function EntornoPage() {
  await requireRole(["ADMIN"]);
  const d = diagnosticarEntorno(process.env);
  const entorno = process.env.VERCEL_ENV ?? "development";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Estado del entorno</h1>
        <p className="mt-2 text-muted-foreground">
          Qué variables tiene <strong>este despliegue</strong>: solo los nombres y si tienen valor. Nunca se muestran los
          valores. Si agregas una variable en Vercel, aparece aquí después de volver a desplegar.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Entorno: <strong>{ETIQUETA_ENTORNO[entorno] ?? entorno}</strong>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen</CardTitle>
          <CardDescription>Lo que decide si el correo y la recuperación de contraseña funcionan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Variables requeridas pendientes:{" "}
            <Badge variant={d.requeridasPendientes === 0 ? "success" : "destructive"}>{d.requeridasPendientes}</Badge>
          </p>
          <p>
            Proveedor de correo activo:{" "}
            <Badge variant={d.correo.proveedor === "ninguno" ? "destructive" : "success"}>
              {d.correo.proveedor === "smtp" ? "SMTP" : d.correo.proveedor === "graph" ? "Microsoft Graph" : "Ninguno (no se envía correo)"}
            </Badge>
            {d.correo.proveedor === "ninguno" && d.correo.faltanSmtp.length > 0 && (
              <span className="ml-2 text-muted-foreground">
                Para el SMTP faltan o están vacías: <code>{d.correo.faltanSmtp.join(", ")}</code>
              </span>
            )}
          </p>
          <p>
            «¿Olvidaste tu contraseña?» disponible:{" "}
            <Badge variant={d.correo.recuperacionDisponible ? "success" : "destructive"}>
              {d.correo.recuperacionDisponible ? "Sí" : "No"}
            </Badge>
          </p>
        </CardContent>
      </Card>

      {d.grupos.map((g) => (
        <Card key={g.titulo}>
          <CardHeader>
            <CardTitle className="text-base">{g.titulo}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variable</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Para qué sirve</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {g.filas.map((f) => (
                  <TableRow key={f.nombre}>
                    <TableCell className="font-mono text-xs">{f.nombre}</TableCell>
                    <TableCell>{TEXTO_ESTADO[f.estado]}</TableCell>
                    <TableCell>
                      <Badge variant={VEREDICTO[f.veredicto].variante}>{VEREDICTO[f.veredicto].texto}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{f.paraQue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
