import { readFileSync } from "node:fs";

const paquete = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

// Origen de Supabase (REST/Realtime): se necesita en connect-src. NEXT_PUBLIC_* no es secreto — ya viaja al cliente.
const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "https://*.supabase.co"; // build sin la variable (nunca debería pasar en Vercel): no rompe el build.
  }
})();
const supabaseWs = supabaseOrigin.replace(/^https:/, "wss:");

// CSP en modo "solo reporte" (Content-Security-Policy-Report-Only): el navegador AVISA en su consola de lo que
// violaría la política, pero no bloquea nada. Es el primer paso antes de imponerla de verdad — cuando lleve un
// tiempo sin violaciones inesperadas, se cambia el nombre de la cabecera a "Content-Security-Policy".
const politicaCSP = [
  "default-src 'self'",
  // Next.js necesita scripts inline (bootstrap de hidratación) y eval en dev; en report-only no hay riesgo de romper nada.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com", // Google Maps (cotizador)
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Tailwind/shadcn inline; fuentes de Google Maps.
  `img-src 'self' data: blob: ${supabaseOrigin} https://*.googleapis.com https://*.gstatic.com https://*.google.com`,
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWs} https://maps.googleapis.com`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'self' https://www.openstreetmap.org", // mapa del seguimiento GPS
  "frame-ancestors 'self'",
].join("; ");

// Cabeceras de seguridad para todas las rutas. Ninguna pantalla usa cámara, micrófono ni geolocalización.
const cabecerasSeguridad = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Content-Security-Policy-Report-Only", value: politicaCSP },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: cabecerasSeguridad }];
  },
  // /coordinacion se fusionó en Dashboard (pestaña «Vehículos y Operación»): los marcadores viejos no dan 404.
  async redirects() {
    return [{ source: "/coordinacion", destination: "/", permanent: true }];
  },
  // Versión que se muestra al pie del menú (la sube solo el PR de release; ver changelog/README.md). El commit
  // (NEXT_PUBLIC_COMMIT_SHA) y el entorno (NEXT_PUBLIC_APP_ENV) los inyectan los workflows de despliegue.
  env: {
    NEXT_PUBLIC_APP_VERSION: paquete.version,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // El historial de versiones se lee de estos archivos en tiempo de ejecución: hay que llevarlos al despliegue.
  // (En Next 15 esta opción salió de `experimental`.)
  outputFileTracingIncludes: {
    "/**/*": ["./CHANGELOG.md", "./changelog/unreleased/**/*"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
