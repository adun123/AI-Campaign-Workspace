import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <PageContainer>
      <SectionHeader title="Settings" description="Workspace, members, billing, and integrations." />
      <div className="mt-6">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Settings UI is scaffolded behind this route. Build out workspace, members,
            billing, and integration sections here.
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
