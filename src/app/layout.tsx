import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Sistema de Gestión de Flotas - Aeromanto",
  description: "Sistema de control de mantenimientos para flota de ambulancias",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} ${bebasNeue.variable}`}>{children}</body>
    </html>
  );
}
