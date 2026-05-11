import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Ayuda nativa al pasar el mouse (atributo `title`) para no añadir dependencias Radix. */
export function HelpTrigger({ text, className }: { text: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground cursor-help align-middle",
        className
      )}
      title={text}
      role="img"
      aria-label={text}
    >
      <HelpCircle className="h-4 w-4" aria-hidden />
    </span>
  );
}
