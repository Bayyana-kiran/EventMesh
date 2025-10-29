"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, GitBranch, MoreVertical } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import {
  useUpdateFlow,
  useCreateFlow,
  useDeleteFlow,
} from "@/lib/hooks/useFlows";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  Flow,
  FlowNode,
  FlowEdge,
  AIFlowGenerationResponse,
} from "@/lib/types";
import { useToast } from "@/lib/hooks/use-toast";
import { useAuth } from "@/lib/auth/AuthContext";
import { useFlows } from "@/lib/hooks/useFlows";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";

export default function FlowsListPage() {
  const { workspace } = useAuth();
  const { data: flowsData, isLoading, error } = useFlows(workspace?.$id);
  const flows = flowsData || [];
  const updateFlow = useUpdateFlow();
  const createFlow = useCreateFlow();
  const deleteFlow = useDeleteFlow();
  const { toast } = useToast();
  const router = useRouter();
  const [intent, setIntent] = useState("");
  const [contextText, setContextText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<AIFlowGenerationResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const onGenerate = async () => {
    setAiError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, context: contextText }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAiError(data?.error || "AI generation failed");
      } else {
        setResult(data.flow);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAiError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const onCreateFromAI = () => {
    if (!result) {
      setAiError("No generated flow to create");
      return;
    }

    const name = intent.trim().slice(0, 60) || "AI generated flow";
    createFlow.mutate(
      {
        name,
        description: result.explanation || "",
        workspaceId: workspace?.$id || "",
        nodes: result.nodes as unknown as Record<string, unknown>[],
        edges: result.edges as unknown as Record<string, unknown>[],
      },
      {
        onSuccess: (newFlow) => {
          toast({ title: "Flow created", description: `${newFlow.name}` });
          // reset dialog state
          setResult(null);
          setIntent("");
          setContextText("");
        },
        onError: (err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          toast({
            title: "Error",
            description: message || "Failed to create flow",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Helper to normalize nodes which may be stored as an array or a JSON string in the DB
  const parseNodes = (
    nodes: Flow["nodes"] | string | undefined
  ): FlowNode[] => {
    if (Array.isArray(nodes)) return nodes as FlowNode[];
    if (!nodes) return [];
    if (typeof nodes === "string") {
      try {
        const parsed = JSON.parse(nodes);
        return Array.isArray(parsed) ? (parsed as FlowNode[]) : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Helper to normalize edges which may be stored as an array or a JSON string in the DB
  const parseEdges = (
    edges: Flow["edges"] | string | undefined
  ): FlowEdge[] => {
    if (Array.isArray(edges)) return edges as FlowEdge[];
    if (!edges) return [];
    if (typeof edges === "string") {
      try {
        const parsed = JSON.parse(edges);
        return Array.isArray(parsed) ? (parsed as FlowEdge[]) : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // debug logs removed before commit

  if (isLoading) {
    return <PageLoading text="Loading flows..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Flows</h1>
            <p className="text-destructive mt-2">
              Error loading flows: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flows</h1>
          <p className="text-muted-foreground mt-2">
            Manage your event routing flows
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* AI create flow dialog trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <GitBranch className="h-4 w-4" />
                Create with AI
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create flow with AI</DialogTitle>
                <DialogDescription>
                  Describe what you want the flow to do and the assistant will
                  generate a flow draft.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-2">
                <label className="text-sm">Intent</label>
                <textarea
                  id="ai-intent"
                  className="w-full rounded border px-3 py-2 text-sm"
                  placeholder="e.g. Forward GitHub push events to Slack channel #builds"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                />

                <label className="text-sm">Context (optional)</label>
                <textarea
                  id="ai-context"
                  className="w-full rounded border px-3 py-2 text-sm"
                  placeholder="Optional context for the assistant"
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                />

                <div className="flex items-center justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIntent("");
                      setContextText("");
                      setResult(null);
                      setAiError(null);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={onGenerate}
                    disabled={generating || intent.trim().length === 0}
                  >
                    {generating ? "Generating…" : "Generate"}
                  </Button>
                </div>

                {aiError && (
                  <div className="text-sm text-destructive">{aiError}</div>
                )}

                {result && (
                  <div className="mt-2">
                    <div className="text-sm font-medium mb-1">Preview</div>
                    <pre className="max-h-64 overflow-auto rounded bg-slate-950/5 p-2 text-xs">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <Button variant="outline" onClick={() => setResult(null)}>
                        Discard
                      </Button>
                      <Button onClick={onCreateFromAI}>Create Flow</Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Link href="/dashboard/flows/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Flow
            </Button>
          </Link>
        </div>
      </div>

      {/* Flows Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {flows.map((flow) => (
          <Card
            key={flow.$id}
            className="hover:border-primary/50 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center">
                    <GitBranch className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{flow.name}</CardTitle>
                    <CardDescription>
                      {flow.description || "No description"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={flow.status === "active" ? "default" : "secondary"}
                  >
                    {flow.status}
                  </Badge>

                  {/* Overflow menu for per-flow actions */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Content
                      sideOffset={6}
                      align="end"
                      className="z-50 min-w-[160px] rounded-md border bg-popover p-1 shadow-md"
                    >
                      <DropdownMenu.Item
                        className="px-2 py-2 text-sm cursor-pointer"
                        onSelect={() =>
                          router.push(`/dashboard/flows/${flow.$id}`)
                        }
                      >
                        Configure
                      </DropdownMenu.Item>

                      <DropdownMenu.Item
                        className="px-2 py-2 text-sm cursor-pointer"
                        onSelect={() => {
                          // Simple duplicate: create a new flow with same nodes/edges
                          const name = `Copy of ${flow.name}`;
                          createFlow.mutate(
                            {
                              name: name,
                              description: flow.description || "",
                              workspaceId: workspace?.$id || "",
                              // parseNodes returns FlowNode[]; cast to API input shape
                              nodes: parseNodes(
                                flow.nodes
                              ) as unknown as Record<string, unknown>[],
                              edges: parseEdges(
                                flow.edges
                              ) as unknown as Record<string, unknown>[],
                            },
                            {
                              onSuccess: (newFlow) => {
                                toast({
                                  title: "Flow duplicated",
                                  description: `${newFlow.name}`,
                                });
                              },
                              onError: (err: unknown) => {
                                const message =
                                  err instanceof Error
                                    ? err.message
                                    : String(err);
                                toast({
                                  title: "Error",
                                  description:
                                    message || "Failed to duplicate flow",
                                  variant: "destructive",
                                });
                              },
                            }
                          );
                        }}
                      >
                        Duplicate
                      </DropdownMenu.Item>

                      <DropdownMenu.Separator className="my-1 h-px bg-border" />

                      <DropdownMenu.Item
                        className="px-2 py-2 text-sm text-destructive cursor-pointer"
                        onSelect={() => {
                          if (!confirm(`Delete flow '${flow.name}'?`)) return;
                          deleteFlow.mutate(flow.$id, {
                            onSuccess: () => {
                              toast({
                                title: "Deleted",
                                description: `${flow.name} deleted`,
                              });
                            },
                            onError: (err: unknown) => {
                              const message =
                                err instanceof Error
                                  ? err.message
                                  : String(err);
                              toast({
                                title: "Error",
                                description: message || "Failed to delete flow",
                                variant: "destructive",
                              });
                            },
                          });
                        }}
                      >
                        Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Webhook URL
                  </div>
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-1 block truncate">
                    {flow.webhook_url}
                  </code>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="text-sm mt-1">
                    {new Date(
                      flow.$createdAt || flow.created_at
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Nodes:{" "}
                    <span className="font-medium">
                      {parseNodes(flow.nodes).length}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Destinations:{" "}
                    <span className="font-medium">
                      {
                        parseNodes(flow.nodes).filter(
                          (n: FlowNode) => n.type === "destination"
                        ).length
                      }
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-64">
                  <Link
                    href={`/dashboard/flows/${flow.$id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
                      Configure
                    </Button>
                  </Link>
                  <Button
                    variant={
                      flow.status === "active" ? "destructive" : "default"
                    }
                    onClick={() => {
                      updateFlow.mutate(
                        {
                          flowId: flow.$id,
                          data: {
                            status:
                              flow.status === "active" ? "paused" : "active",
                          },
                        },
                        {
                          onSuccess: () => {
                            toast({
                              title: "Updated",
                              description: `Flow ${flow.name} is now ${
                                flow.status === "active" ? "paused" : "active"
                              }`,
                            });
                          },
                          onError: (err: unknown) => {
                            const message =
                              err instanceof Error ? err.message : String(err);
                            toast({
                              title: "Error",
                              description: message || "Failed to update flow",
                              variant: "destructive",
                            });
                          },
                        }
                      );
                    }}
                  >
                    {flow.status === "active" ? "Pause" : "Activate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state for when there are no flows */}
      {flows.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No flows yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first flow to start routing events
            </p>
            <Link href="/dashboard/flows/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Flow
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
