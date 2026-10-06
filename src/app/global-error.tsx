"use client";

import { useEffect } from "react";
import "./globals.css";
import { ErrorView } from "@/components/layout/error-view";

// Replaces the root layout when it fails, so it brings its own <html> and <body>.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <ErrorView fullPage reset={reset} digest={error.digest} />
      </body>
    </html>
  );
}
