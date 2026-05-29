import { brandKits, currentWorkspace } from "@/lib/mock-data";
import { waitForMock } from "@/services/mock-runtime";
import type { ID } from "@/types/domain";

export async function listBrandKits(workspaceId: ID = currentWorkspace.id) {
  await waitForMock(240);
  return brandKits.filter((brandKit) => brandKit.workspaceId === workspaceId);
}

export async function getActiveBrandKit(workspaceId: ID = currentWorkspace.id) {
  const kits = await listBrandKits(workspaceId);
  return kits[0] ?? null;
}
