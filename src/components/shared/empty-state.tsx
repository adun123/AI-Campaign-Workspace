import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <Card className="p-6 text-center">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}
