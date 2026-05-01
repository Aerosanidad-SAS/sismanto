import { getSession, getProfile } from "@/app/api/actions/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PendingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await getProfile();
  if (profile) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cuenta pendiente</CardTitle>
          <CardDescription>
            Su cuenta aún no tiene un rol asignado. Contacte al administrador del sistema para que le asigne permisos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Email: {session.user.email}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
