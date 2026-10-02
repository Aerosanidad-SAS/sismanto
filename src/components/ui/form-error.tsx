import * as React from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FormErrorProps extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "children"> {
  /** Error text. When empty/undefined nothing is rendered. */
  children?: React.ReactNode;
}

/**
 * Inline error message. `role="alert"` makes screen readers announce it when it appears.
 * Icon + text, never color alone. Link it to its control with `aria-describedby` (Field does this for you).
 */
export function FormError({ children, className, ...props }: FormErrorProps) {
  if (children === undefined || children === null || children === false || children === "") return null;
  return (
    <p
      role="alert"
      className={cn("flex items-start gap-1.5 text-sm font-medium text-destructive", className)}
      {...props}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
