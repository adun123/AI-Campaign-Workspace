import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { BrandKitOverview } from "@/features/brand-kit/components/brand-kit-overview";

export const metadata = { title: "Brand Kit" };

export default function BrandKitPage() {
  return (
    <PageContainer>
      <SectionHeader
        title="Brand Kit"
        description="Colors, typography, and voice guardrails applied to AI generations."
      />
      <div className="mt-6">
        <BrandKitOverview />
      </div>
    </PageContainer>
  );
}
