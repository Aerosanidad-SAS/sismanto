"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/layout/error-view";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorView fullPage reset={reset} digest={error.digest} />;
}
