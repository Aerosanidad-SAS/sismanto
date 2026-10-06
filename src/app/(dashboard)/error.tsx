"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/layout/error-view";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorView reset={reset} digest={error.digest} />;
}
