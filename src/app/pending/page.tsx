import { getSession, getProfile, signOut } from "@/app/api/actions/auth";
import { getCompanyBranding } from "@/app/api/actions/company-settings";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function PendingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await getProfile();
  if (profile) redirect("/");

  const branding = await getCompanyBranding();

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-muted/40 px-4 py-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <Card className="w-full max-w-md border-border shadow-md">
        <CardHeader className="space-y-4">
          <div className="relative mx-auto h-12 w-full max-w-[14rem] overflow-hidden rounded-md bg-black px-3 py-2">
            <Image
              src={branding.logo_url ?? "/brand/alianza.png"}
              alt="Aerosanidad e Inter Assist"
              fill
              className="object-contain"
              sizes="224px"
              priority
              unoptimized={Boolean(branding.logo_url)}
            />
          </div>
          <div>
            <CardTitle>Cuenta pendiente</CardTitle>
            <CardDescription>
              Su cuenta aún no tiene un rol asignado. Contacte al administrador del sistema para que le asigne
              permisos.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Correo:</span> {session.user.email}
          </p>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full min-h-11 touch-manipulation">
              Cerrar sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
