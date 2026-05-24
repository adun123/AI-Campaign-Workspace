import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <PageContainer>
      <SectionHeader
        title="Dashboard"
        description="At-a-glance look at your campaigns, assets, and schedule."
      />
      <div className="mt-6 space-y-8">
        <DashboardOverview />
      </div>
    </PageContainer>
  );
}
