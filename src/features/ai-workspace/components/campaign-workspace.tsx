"use client";

import * as React from "react";
import type { AIModel, AssetType, Campaign } from "@/types";
import { WorkspaceHeader } from "./workspace-header";
import { IdeationPanel } from "./ideation-panel";
import { IterationHistory } from "./iteration-history";
import { PropertiesPanel } from "./properties-panel";
import { useAIGeneration } from "../hooks/use-ai-generation";

/**
 * The Campaign Workspace.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────┐
 *   │ Workspace header (campaign meta, actions)        │
 *   ├──────────┬─────────────────────────┬─────────────┤
 *   │ History  │ Ideation + assets       │ Properties  │
 *   │ (left)   │ (center, primary stage) │ (right)     │
 *   └──────────┴─────────────────────────┴─────────────┘
 *
 * Workflow software, not chat. The composer lives at the bottom of the
 * center stage; outputs render inline above it as cards.
 */
export function CampaignWorkspace({ campaign }: { campaign: Campaign }) {
  const { generate, retry, cancel, current, history, setCurrentId } = useAIGeneration({
    campaignId: campaign.id,
  });

  const [outputType, setOutputType] = React.useState<AssetType>("image");
  const [model, setModel] = React.useState<AIModel>("image-v1");
  const [tone, setTone] = React.useState("confident");
  const [aspectRatio, setAspectRatio] = React.useState<"1:1" | "4:5" | "9:16" | "16:9">("1:1");

  // Keep the model in sync with the chosen output type by default.
  React.useEffect(() => {
    if (outputType === "image") setModel("image-v1");
    else if (outputType === "video") setModel("video-v1");
    else setModel("copy-v1");
  }, [outputType]);

  return (
    <div className="flex h-screen flex-col">
      <WorkspaceHeader campaign={campaign} />
      <div className="flex min-h-0 flex-1">
        <IterationHistory
          history={history}
          currentId={current?.id ?? null}
          onSelect={setCurrentId}
        />
        <div className="min-w-0 flex-1">
          <IdeationPanel
            current={current}
            outputType={outputType}
            model={model}
            onGenerate={(params) =>
              generate({
                ...params,
                options: {
                  ...params.options,
                  tone,
                  aspectRatio,
                  brandKitId: campaign.brandKitId,
                },
              })
            }
            onRetry={retry}
            onCancel={cancel}
          />
        </div>
        <PropertiesPanel
          campaign={campaign}
          outputType={outputType}
          onChangeOutputType={setOutputType}
          model={model}
          onChangeModel={setModel}
          tone={tone}
          onChangeTone={setTone}
          aspectRatio={aspectRatio}
          onChangeAspectRatio={setAspectRatio}
        />
      </div>
    </div>
  );
}
