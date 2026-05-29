import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background p-6 text-text-primary">
      <Card className="mx-auto mt-12 max-w-3xl animate-pulse p-6">
        <div className="h-4 w-32 rounded-full bg-surface-elevated" />
        <div className="mt-6 h-10 w-2/3 rounded-full bg-surface-elevated" />
        <div className="mt-4 h-4 w-full rounded-full bg-surface-elevated" />
        <div className="mt-3 h-4 w-5/6 rounded-full bg-surface-elevated" />
      </Card>
    </main>
  );
}
