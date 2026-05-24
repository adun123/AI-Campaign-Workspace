import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { SchedulerList } from "@/features/scheduler/components/scheduler-list";

export const metadata = { title: "Scheduler" };

export default function SchedulerPage() {
  return (
    <PageContainer>
      <SectionHeader
        title="Scheduler"
        description="Upcoming and recent posts across all campaigns."
      />
      <div className="mt-6">
        <SchedulerList />
      </div>
    </PageContainer>
  );
}
