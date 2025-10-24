"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Webhook } from "lucide-react";
import { cn } from "@/lib/utils";

export type SourceNodeData = {
  label: string;
  webhookUrl?: string;
};

function SourceNode({ data, selected }: NodeProps) {
  const nodeData = data as SourceNodeData;
  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg border-2 bg-card shadow-lg min-w-[200px] transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Webhook className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground font-medium">
            SOURCE
          </div>
          <div className="font-semibold text-sm">{nodeData.label}</div>
        </div>
      </div>

      {nodeData.webhookUrl && (
        <div className="mt-2 p-2 bg-muted rounded text-xs font-mono truncate">
          {nodeData.webhookUrl}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
    </div>
  );
}

export default memo(SourceNode);
