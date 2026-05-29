import { currentUser, currentWorkspace } from "@/lib/mock-data";
import { waitForMock } from "@/services/mock-runtime";

export async function getSession() {
  await waitForMock(160);
  return {
    user: currentUser,
    workspace: currentWorkspace,
  };
}
