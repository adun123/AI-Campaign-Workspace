import { create } from "zustand";
import type { ID } from "@/types";

export interface WorkspaceState {
  /** Currently selected campaign in the sidebar / workspace. */
  activeCampaignId: ID | null;
  /** Current generation being tracked in the workspace. */
  activeGenerationId: ID | null;
  /** IDs of assets selected for bulk operations. */
  selectedAssetIds: ID[];
}

export interface WorkspaceActions {
  setActiveCampaign: (id: ID | null) => void;
  setActiveGeneration: (id: ID | null) => void;
  selectAsset: (id: ID) => void;
  deselectAsset: (id: ID) => void;
  toggleAssetSelection: (id: ID) => void;
  clearAssetSelection: () => void;
}

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>((set) => ({
  activeCampaignId: null,
  activeGenerationId: null,
  selectedAssetIds: [],

  setActiveCampaign: (id) => set({ activeCampaignId: id }),
  setActiveGeneration: (id) => set({ activeGenerationId: id }),

  selectAsset: (id) =>
    set((s) => ({
      selectedAssetIds: s.selectedAssetIds.includes(id)
        ? s.selectedAssetIds
        : [...s.selectedAssetIds, id],
    })),
  deselectAsset: (id) =>
    set((s) => ({
      selectedAssetIds: s.selectedAssetIds.filter((x) => x !== id),
    })),
  toggleAssetSelection: (id) =>
    set((s) => ({
      selectedAssetIds: s.selectedAssetIds.includes(id)
        ? s.selectedAssetIds.filter((x) => x !== id)
        : [...s.selectedAssetIds, id],
    })),
  clearAssetSelection: () => set({ selectedAssetIds: [] }),
}));
