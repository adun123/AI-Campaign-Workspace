import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted/70 focus:border-accent/60 focus:ring-2 focus:ring-accent/15",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-none rounded-control border bg-surface-muted px-3 py-3 text-sm leading-6 text-text-primary outline-none transition placeholder:text-text-muted/70 focus:border-accent/60 focus:ring-2 focus:ring-accent/15",
        className,
      )}
      {...props}
    />
  );
}
