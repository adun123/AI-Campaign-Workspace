import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { AssetGrid } from "@/features/assets/components/asset-grid";

export const metadata = { title: "Asset Library" };

export default function AssetsPage() {
  return (
    <PageContainer>
      <SectionHeader
        title="Asset Library"
        description="Everything you've generated and saved across campaigns."
      />
      <div className="mt-6">
        <AssetGrid />
      </div>
    </PageContainer>
  );
}
