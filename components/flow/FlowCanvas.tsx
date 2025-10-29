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
  Node,
  Edge as FlowEdge,
  NodeTypes,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

interface FlowData {
  nodes?: string;
  edges?: string;
  webhook_url?: string;
  status?: string;
  [k: string]: unknown;
}

type FlowNodeData = {
  label?: string;
  webhookUrl?: string;
  type?: "javascript" | "webhook" | string;
  [k: string]: unknown;
};

interface FlowCanvasProps {
  flowId: string;
  initialFlow?: FlowData | null;
}

export default function FlowCanvas({ flowId, initialFlow }: FlowCanvasProps) {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowNodeData>>(
    []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);
  const [selectedNode, setSelectedNode] = useState<Node<FlowNodeData> | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [aiIntent, setAiIntent] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

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

  const onNodeClick = useCallback(
    (_event: unknown, node: Node<FlowNodeData>) => {
      setSelectedNode(node);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleNodeConfigUpdate = useCallback(
    (nodeId: string, newData: Partial<FlowNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...newData },
            } as Node<FlowNodeData>;
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
      setSelectedNode(null);
    },
    [setNodes, setEdges]
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
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
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
      const newStatus = initialFlow?.status === "active" ? "paused" : "active";

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
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
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
    const newNode: Node<FlowNodeData> = {
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
    const newNode: Node<FlowNodeData> = {
      id: `transform-${Date.now()}`,
      type: "transform",
      position: { x: Math.random() * 300 + 300, y: Math.random() * 300 },
      data: { label: "New Transform", type: "javascript" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addDestinationNode = () => {
    const newNode: Node<FlowNodeData> = {
      id: `destination-${Date.now()}`,
      type: "destination",
      position: { x: Math.random() * 300 + 600, y: Math.random() * 300 },
      data: { label: "New Destination", type: "webhook" },
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
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[min(96vw,640px)] max-h-[72vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>AI Generate Flow</DialogTitle>
                <DialogDescription>
                  Enter a short intent and let the assistant generate nodes and
                  edges for this canvas.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-2 text-foreground p-2">
                <label className="text-sm text-muted-foreground">Intent</label>
                <textarea
                  className="w-full rounded border px-3 py-2 text-sm bg-card text-foreground placeholder:text-muted-foreground border-border resize-y max-h-40"
                  placeholder="e.g. Forward GitHub push events to Slack #builds"
                  value={aiIntent}
                  onChange={(e) => setAiIntent(e.target.value)}
                />

                <div className="flex items-center justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAiIntent("");
                      setAiResult(null);
                      setAiError(null);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={async () => {
                      setAiError(null);
                      setAiGenerating(true);
                      try {
                        const res = await fetch("/api/ai/generate-flow", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            intent: aiIntent,
                            context: initialFlow?.webhook_url || "",
                          }),
                        });
                        const data = await res.json();
                        if (!res.ok || !data.success) {
                          setAiError(data?.error || "AI generation failed");
                        } else {
                          setAiResult(data.flow);
                        }
                      } catch (err: unknown) {
                        const msg =
                          err instanceof Error ? err.message : String(err);
                        setAiError(msg);
                      } finally {
                        setAiGenerating(false);
                      }
                    }}
                    disabled={aiGenerating || aiIntent.trim().length === 0}
                  >
                    {aiGenerating ? "Generating…" : "Generate"}
                  </Button>
                </div>

                {aiError && (
                  <div className="text-sm text-destructive">{aiError}</div>
                )}

                {aiResult && (
                  <div className="mt-2 text-foreground">
                    <div className="text-sm font-medium mb-1 text-foreground">
                      Preview
                    </div>
                    <pre className="max-h-44 overflow-auto rounded bg-muted p-2 text-xs text-foreground font-mono">
                      {JSON.stringify(aiResult, null, 2)}
                    </pre>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <Button
                        variant="outline"
                        onClick={() => setAiResult(null)}
                      >
                        Discard
                      </Button>
                      <Button
                        onClick={() => {
                          // Apply generated nodes/edges to canvas
                          if (!aiResult) return;
                          const aiPrefix = `ai-${Date.now()}-`;

                          // Build id mapping from original AI ids -> new prefixed ids
                          const idMap = new Map<string | number, string>();

                          const newNodes: Node<FlowNodeData>[] = (
                            aiResult.nodes || []
                          ).map((n: any, idx: number) => {
                            const originalId = n.id ?? idx;
                            const newId = `${aiPrefix}${String(originalId)}`;
                            idMap.set(String(originalId), newId);

                            const rawPos = n.position || {};
                            const pos = {
                              x: Number(
                                rawPos.x ??
                                  rawPos["x"] ??
                                  Math.random() * 400 + 100
                              ),
                              y: Number(
                                rawPos.y ??
                                  rawPos["y"] ??
                                  Math.random() * 200 + 50
                              ),
                            };

                            // Determine node kind
                            const kind = (
                              n.type ||
                              n.nodeType ||
                              "transform"
                            ).toString();

                            // Normalize data per node component expectations
                            let data: any = {};
                            if (kind === "source") {
                              data.label =
                                n.data?.label || n.label || "Webhook Source";
                              data.webhookUrl =
                                n.data?.webhookUrl ||
                                n.data?.webhook_url ||
                                n.webhook_url ||
                                initialFlow?.webhook_url ||
                                "";
                            } else if (kind === "transform") {
                              const ttype =
                                n.data?.type ||
                                n.type ||
                                n.transformType ||
                                "javascript";
                              data.label =
                                n.data?.label ||
                                n.label ||
                                (ttype === "ai" ? "AI Transform" : "Transform");
                              data.type = ttype === "ai" ? "ai" : "javascript";
                              data.code =
                                n.data?.code || n.code || n.script || "";
                            } else if (kind === "destination") {
                              const dtype = (
                                n.data?.type ||
                                n.destinationType ||
                                n.type ||
                                "webhook"
                              ).toString();
                              data.label =
                                n.data?.label || n.label || "Destination";
                              data.type = [
                                "slack",
                                "discord",
                                "email",
                                "webhook",
                              ].includes(dtype)
                                ? dtype
                                : "webhook";
                              data.config = n.data?.config || n.config || {};
                            } else {
                              // fallback generic
                              data = n.data || { label: n.label || "AI Node" };
                            }

                            const nodeType =
                              kind === "source" ||
                              kind === "transform" ||
                              kind === "destination"
                                ? kind
                                : "transform";

                            return {
                              id: newId,
                              type: nodeType,
                              position: pos,
                              data,
                            } as Node<FlowNodeData>;
                          });

                          // Map edges, only include those whose endpoints exist after mapping
                          const newEdges: FlowEdge[] = (aiResult.edges || [])
                            .map((e: any, idx: number) => {
                              const srcKey = String(e.source ?? "");
                              const tgtKey = String(e.target ?? "");
                              let source =
                                idMap.get(srcKey) ||
                                idMap.get(String(Number(srcKey))) ||
                                null;
                              let target =
                                idMap.get(tgtKey) ||
                                idMap.get(String(Number(tgtKey))) ||
                                null;

                              // Heuristic: if AI provided human-readable labels instead of ids, try to resolve by label
                              if (!source) {
                                const match = newNodes.find(
                                  (nn) =>
                                    (nn.data as any)?.label === e.source ||
                                    (nn.data as any)?.label === String(e.source)
                                );
                                if (match) source = match.id;
                              }
                              if (!target) {
                                const match = newNodes.find(
                                  (nn) =>
                                    (nn.data as any)?.label === e.target ||
                                    (nn.data as any)?.label === String(e.target)
                                );
                                if (match) target = match.id;
                              }
                              if (!source || !target) return null;
                              const newId = `${aiPrefix}${e.id ?? idx}`;
                              return {
                                id: newId,
                                source,
                                target,
                                animated: true,
                              } as FlowEdge;
                            })
                            .filter(Boolean) as FlowEdge[];

                          if (newNodes.length === 0) {
                            toast({
                              title: "AI result empty",
                              description: "No nodes returned from AI to apply",
                              variant: "destructive",
                            });
                            return;
                          }

                          // Merge into current canvas
                          setNodes((nds) => [...nds, ...newNodes]);
                          setEdges((eds) => [...eds, ...newEdges]);

                          toast({
                            title: "AI flow applied",
                            description: `Added ${newNodes.length} nodes and ${newEdges.length} edges`,
                          });

                          // clear AI state
                          setAiResult(null);
                          setAiIntent("");
                        }}
                      >
                        Apply to canvas
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
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
          onDelete={(id) => handleDeleteNode(id)}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
