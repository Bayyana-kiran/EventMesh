"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Code, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export type TransformNodeData = {
  label: string;
  type: "javascript" | "ai";
  code?: string;
};

function TransformNode({ data, selected }: NodeProps) {
  const nodeData = data as TransformNodeData;
  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg border-2 bg-card shadow-lg min-w-[200px] transition-all",
        selected ? "border-accent ring-2 ring-accent/20" : "border-border"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-accent !border-2 !border-background"
      />

      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-md bg-accent/10 flex items-center justify-center">
          {nodeData.type === "ai" ? (
            <Bot className="h-4 w-4 text-accent" />
          ) : (
            <Code className="h-4 w-4 text-accent" />
          )}
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground font-medium">
            TRANSFORM
          </div>
          <div className="font-semibold text-sm">{nodeData.label}</div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        {nodeData.type === "ai" ? "AI-powered" : "JavaScript"}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-accent !border-2 !border-background"
      />
    </div>
  );
}

export default memo(TransformNode);
