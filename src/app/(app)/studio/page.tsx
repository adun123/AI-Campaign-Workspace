import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { campaignsService } from "@/services";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Content Studio" };

export default async function StudioPage() {
  const campaigns = await campaignsService.list();
  const active = campaigns.filter((c) => c.status === "active");

  return (
    <PageContainer>
      <SectionHeader
        title="Content Studio"
        description="Pick a campaign to enter its workspace and start generating."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {active.map((c) => (
          <Card key={c.id} className="p-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" /> {c.objective}
              </div>
              <h3 className="mt-2 text-base font-medium">{c.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <Button asChild size="sm" className="mt-4">
                <Link href={`/campaigns/${c.id}/workspace`}>
                  Open workspace <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
