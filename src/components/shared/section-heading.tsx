import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, actions }: { eyebrow?: string; title: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-xs font-medium uppercase tracking-[0.24em] text-accent">{eyebrow}</p> : null}
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-text-primary">{title}</h2>
      </div>
      {actions}
    </div>
  );
}
