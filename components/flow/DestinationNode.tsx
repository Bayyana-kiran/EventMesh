"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Send, MessageSquare, Mail, Webhook, TestTube } from "lucide-react";
import { cn } from "@/lib/utils";

export type DestinationNodeData = {
  label: string;
  type: "slack" | "discord" | "email" | "webhook" | "test";
  config?: Record<string, unknown>;
};

const iconMap = {
  slack: MessageSquare,
  discord: MessageSquare,
  email: Mail,
  webhook: Webhook,
  test: TestTube,
};

function DestinationNode({ data, selected }: NodeProps) {
  const nodeData = data as DestinationNodeData;
  const Icon = iconMap[nodeData.type] || Send;

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg border-2 bg-card shadow-lg min-w-[200px] transition-all",
        selected ? "border-secondary ring-2 ring-secondary/20" : "border-border"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-secondary !border-2 !border-background"
      />

      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-md bg-secondary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-secondary" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground font-medium">
            DESTINATION
          </div>
          <div className="font-semibold text-sm">{nodeData.label}</div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground capitalize">
        {nodeData.type}
      </div>
    </div>
  );
}

export default memo(DestinationNode);
