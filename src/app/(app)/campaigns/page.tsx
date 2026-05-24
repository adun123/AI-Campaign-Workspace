import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { CampaignsGrid } from "@/features/campaigns/components/campaigns-grid";

export const metadata = { title: "Campaigns" };

export default function CampaignsPage() {
  return (
    <PageContainer>
      <SectionHeader
        title="Campaigns"
        description="Each campaign is a workspace for ideation, generation, and scheduling."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New campaign
          </Button>
        }
      />
      <div className="mt-6">
        <CampaignsGrid />
      </div>
    </PageContainer>
  );
}
