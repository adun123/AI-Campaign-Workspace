import { campaigns } from "@/lib/mock-data";
import { waitForMock } from "@/services/mock-runtime";

export async function listCampaigns() {
  await waitForMock(220);
  return campaigns;
}

export async function getActiveCampaign() {
  await waitForMock(220);
  return campaigns[0];
}
