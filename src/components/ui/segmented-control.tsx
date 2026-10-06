"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onValueChange: (value: T) => void;
  /** Required: a radiogroup needs a name. Use `aria-label` or `aria-labelledby`. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  fullWidth?: boolean;
  className?: string;
}

/**
 * Single-choice filter as an accessible radiogroup: one tab stop, arrow keys move and select
 * (Home/End jump), 44 px targets. Use for "Abiertos / Todos hoy" style filters.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  fullWidth,
  className,
  ...aria
}: SegmentedControlProps<T>) {
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);

  const move = (from: number, delta: 1 | -1 | "first" | "last") => {
    if (enabled.length === 0) return;
    const pos = enabled.indexOf(from);
    let nextPos: number;
    if (delta === "first") nextPos = 0;
    else if (delta === "last") nextPos = enabled.length - 1;
    else nextPos = (pos + delta + enabled.length) % enabled.length;
    const idx = enabled[nextPos];
    onValueChange(options[idx].value);
    refs.current[idx]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        move(index, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        move(index, -1);
        break;
      case "Home":
        event.preventDefault();
        move(index, "first");
        break;
      case "End":
        event.preventDefault();
        move(index, "last");
        break;
    }
  };

  const selectedIndex = options.findIndex((o) => o.value === value && !o.disabled);
  const tabStop = selectedIndex >= 0 ? selectedIndex : enabled[0];

  return (
    <div
      role="radiogroup"
      {...aria}
      className={cn(
        "inline-flex rounded-lg border border-input bg-muted p-1",
        fullWidth && "flex w-full",
        className
      )}
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={option.disabled}
            tabIndex={index === tabStop ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "inline-flex min-h-touch items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              fullWidth && "flex-1",
              checked
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
