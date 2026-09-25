import { readFileSync } from "node:fs";

const paquete = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

// Cabeceras de seguridad para todas las rutas. Sin CSP a propósito: una política estricta puede romper la app y
// necesita probarse aparte. Ninguna pantalla usa cámara, micrófono ni geolocalización.
const cabecerasSeguridad = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: cabecerasSeguridad }];
  },
  // Versión que se muestra al pie del menú (la sube solo el PR de release; ver changelog/README.md). El commit
  // (NEXT_PUBLIC_COMMIT_SHA) y el entorno (NEXT_PUBLIC_APP_ENV) los inyectan los workflows de despliegue.
  env: {
    NEXT_PUBLIC_APP_VERSION: paquete.version,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
    // El historial de versiones se lee de estos archivos en tiempo de ejecución: hay que llevarlos al despliegue.
    outputFileTracingIncludes: {
      "/**/*": ["./CHANGELOG.md", "./changelog/unreleased/**/*"],
    },
  },
};

export default nextConfig;
