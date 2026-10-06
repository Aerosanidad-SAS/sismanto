"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { fieldIds, joinIds } from "@/lib/ui-forms";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";

/** Props that Field injects into the control. Spread them on the element that holds focus. */
export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
}

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  /** Error message (string from react-hook-form `errors.x?.message`, or any node). Falsy = no error. */
  error?: React.ReactNode;
  required?: boolean;
  /** Override the generated id (e.g. to keep a stable id for tests). */
  id?: string;
  /** Visually hide the label but keep it for screen readers. */
  hideLabel?: boolean;
  /**
   * - An element (Input, Textarea, a register()-ed input): Field clones it with id / aria-*.
   * - A function: use it for wrappers without a DOM node, e.g. Radix Select:
   *   `{(p) => <Select ...><SelectTrigger {...p}><SelectValue /></SelectTrigger>...</Select>}`
   */
  children: React.ReactElement | ((props: FieldControlProps) => React.ReactNode);
}

/**
 * Label + control + hint + error with correct a11y wiring (WCAG 1.3.1, 3.3.1, 3.3.2, 4.1.2):
 * label[for] -> control id, aria-describedby -> hint and error, aria-invalid when there is an error.
 * Required: visual asterisk (aria-hidden) plus "(obligatorio)" for screen readers.
 */
export function Field({ label, hint, error, required, id, hideLabel, children, className, ...props }: FieldProps) {
  const generated = React.useId();
  const ids = fieldIds(id ?? generated);
  const hasError = !(error === undefined || error === null || error === false || error === "");
  const hasHint = !(hint === undefined || hint === null || hint === false || hint === "");

  const controlProps: FieldControlProps = {
    id: ids.control,
    "aria-describedby": joinIds(hasHint && ids.hint, hasError && ids.error),
    "aria-invalid": hasError ? true : undefined,
    "aria-required": required ? true : undefined,
  };

  let control: React.ReactNode;
  if (typeof children === "function") {
    control = children(controlProps);
  } else if (React.isValidElement<Record<string, unknown>>(children)) {
    control = React.cloneElement(children, {
      ...controlProps,
      "aria-describedby": joinIds(
        children.props["aria-describedby"] as string | undefined,
        controlProps["aria-describedby"]
      ),
    });
  } else {
    control = children;
  }

  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      <Label htmlFor={ids.control} className={cn("block leading-snug", hideLabel && "sr-only")}>
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-0.5 text-destructive">
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </>
        ) : null}
      </Label>
      {control}
      {hasHint ? (
        <p id={ids.hint} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {hasError ? <FormError id={ids.error}>{error}</FormError> : null}
    </div>
  );
}
