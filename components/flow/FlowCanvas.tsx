"use client";

import { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  NodeTypes,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Plus, Play, Save, Sparkles, Pause } from "lucide-react";
import SourceNode from "./SourceNode";
import TransformNode from "./TransformNode";
import DestinationNode from "./DestinationNode";
import { NodeConfigPanel } from "./NodeConfigPanel";
import { useToast } from "@/lib/hooks/use-toast";

const nodeTypes: NodeTypes = {
  source: SourceNode,
  transform: TransformNode,
  destination: DestinationNode,
};

interface FlowCanvasProps {
  flowId: string;
  initialFlow?: any;
}

export default function FlowCanvas({ flowId, initialFlow }: FlowCanvasProps) {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  // Load initial flow data
  useEffect(() => {
    if (initialFlow) {
      try {
        const loadedNodes = initialFlow.nodes
          ? JSON.parse(initialFlow.nodes)
          : [];
        const loadedEdges = initialFlow.edges
          ? JSON.parse(initialFlow.edges)
          : [];

        setNodes(loadedNodes);
        setEdges(loadedEdges);
      } catch (error) {
        console.error("Failed to parse flow data:", error);
        // Start with empty canvas if parsing fails
        setNodes([]);
        setEdges([]);
      }
    }
  }, [initialFlow, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_event: any, node: any) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleNodeConfigUpdate = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...newData },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const saveFlow = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/flows/${flowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodes: JSON.stringify(nodes),
          edges: JSON.stringify(edges),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save flow");
      }

      toast({
        title: "Flow saved",
        description: "Your flow has been saved successfully",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Save failed",
        description: errorMessage || "Failed to save flow",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFlowStatus = async () => {
    setIsActivating(true);
    try {
      const newStatus = initialFlow.status === "active" ? "paused" : "active";

      const response = await fetch(`/api/flows/${flowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update flow status");
      }

      toast({
        title: `Flow ${newStatus}`,
        description: `Your flow is now ${newStatus}`,
      });

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Status update failed",
        description: errorMessage || "Failed to update flow status",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const addSourceNode = () => {
    const newNode = {
      id: `source-${Date.now()}`,
      type: "source",
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      data: {
        label: "New Webhook",
        webhookUrl: initialFlow?.webhook_url || "",
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addTransformNode = () => {
    const newNode = {
      id: `transform-${Date.now()}`,
      type: "transform",
      position: { x: Math.random() * 300 + 300, y: Math.random() * 300 },
      data: { label: "New Transform", type: "javascript" as const },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addDestinationNode = () => {
    const newNode: any = {
      id: `destination-${Date.now()}`,
      type: "destination",
      position: { x: Math.random() * 300 + 600, y: Math.random() * 300 },
      data: { label: "New Destination", type: "webhook" as const },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="h-[calc(100vh-20rem)] w-full rounded-lg border bg-muted/30 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "source") return "hsl(var(--primary))";
            if (node.type === "transform") return "hsl(var(--accent))";
            return "hsl(var(--secondary))";
          }}
          className="!bg-background !border-border"
        />

        <Panel position="top-left" className="flex gap-2">
          <Button
            onClick={addSourceNode}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Source
          </Button>
          <Button
            onClick={addTransformNode}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Transform
          </Button>
          <Button
            onClick={addDestinationNode}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Destination
          </Button>
        </Panel>

        <Panel position="top-right" className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2" disabled>
            <Sparkles className="h-4 w-4" />
            AI Generate
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={saveFlow}
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Flow"}
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={toggleFlowStatus}
            disabled={isActivating}
          >
            {initialFlow?.status === "active" ? (
              <>
                <Pause className="h-4 w-4" />
                {isActivating ? "Pausing..." : "Pause"}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {isActivating ? "Activating..." : "Activate"}
              </>
            )}
          </Button>
        </Panel>
      </ReactFlow>

      {/* Node Configuration Panel */}
      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onUpdate={(data) => handleNodeConfigUpdate(selectedNode.id, data)}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
