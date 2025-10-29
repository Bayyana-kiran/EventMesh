/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Play, Check } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import FlowCanvas from "@/components/flow/FlowCanvas";
import { Flow } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { validateSchema } from "@/lib/utils";

export default function PlaygroundPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [testPayload, setTestPayload] = useState(`{
  "event": "user.created",
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}`);
  const [response, setResponse] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const { toast } = useToast();
  const { workspace } = useAuth();

  const fetchFlows = useCallback(async () => {
    if (!workspace?.$id) return;

    try {
      const res = await fetch(`/api/flows?workspaceId=${workspace.$id}`);
      const data = await res.json();
      if (data.documents) {
        setFlows(data.documents);
        if (data.documents.length > 0) {
          handleFlowSelect(data.documents[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching flows:", error);
    }
  }, [workspace?.$id]);

  const fetchTestResults = useCallback(async () => {
    if (!selectedFlow?.$id) return;

    setLoadingResults(true);
    try {
      const res = await fetch(
        `/api/executions?flowId=${selectedFlow.$id}&limit=10`
      );
      const data = await res.json();
      if (data.executions) {
        setTestResults(data.executions);
      }
    } catch (error) {
      console.error("Error fetching test results:", error);
    } finally {
      setLoadingResults(false);
    }
  }, [selectedFlow?.$id]);

  useEffect(() => {
    if (selectedFlow) {
      fetchTestResults();
    }
  }, [selectedFlow, fetchTestResults]);

  useEffect(() => {
    fetchFlows();
  }, [workspace?.$id, fetchFlows]);

  const handleFlowSelect = (flow: Flow) => {
    setSelectedFlow(flow);
    setWebhookUrl(flow.webhook_url || "");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Webhook URL copied to clipboard",
    });
  };

  const sendTestWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please select a flow first",
        variant: "destructive",
      });
      return;
    }

    let payload: any;

    try {
      // Validate JSON
      payload = JSON.parse(testPayload);
    } catch {
      toast({
        title: "Invalid JSON",
        description: "Please check your payload syntax",
        variant: "destructive",
      });
      return;
    }

    // Validate payload against schema if defined
    if (selectedFlow) {
      const nodes = (selectedFlow as any).nodes;
      const parsedNodes = typeof nodes === "string" ? JSON.parse(nodes) : nodes;
      const sourceNode = parsedNodes?.find(
        (node: any) => node.type === "source"
      );

      if (sourceNode?.data?.config?.schema) {
        const validation = validateSchema(
          payload,
          sourceNode.data.config.schema
        );
        if (!validation.success) {
          toast({
            title: "Schema Validation Failed",
            description:
              validation.error || "Payload does not match the expected schema",
            variant: "destructive",
          });
          return;
        }
      }
    }

    setSending(true);
    setResponse(null);
    setExecutionTime(null);

    const startTime = Date.now();

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      const data = await res.json();
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Webhook sent successfully",
        });
        // Refresh test results after successful execution
        setTimeout(() => fetchTestResults(), 1000);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send webhook",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      setResponse({
        status: 0,
        statusText: "Network Error",
        data: { error: errorMessage },
      });
      toast({
        title: "Error",
        description: errorMessage || "Failed to send webhook",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Gradient background and grid overlay */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-muted/30" />
      <div
        className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)) 1px, transparent 1px),linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-lg">
          Playground
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Test your webhooks and transformations in real time
        </p>
      </div>

      <Tabs defaultValue="webhook" className="space-y-6">
        <TabsList className="mb-2">
          <TabsTrigger value="webhook">Webhook Tester</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="editor">Flow Editor</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="webhook" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Request */}
            <Card className="shadow-xl border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Send Test Webhook
                </CardTitle>
                <CardDescription>
                  Test your webhook endpoint with custom payloads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base">Select Flow</Label>
                  <Select
                    value={selectedFlow?.$id}
                    onValueChange={(flowId) => {
                      const flow = flows.find((f) => f.$id === flowId);
                      if (flow) handleFlowSelect(flow);
                    }}
                  >
                    <SelectTrigger className="mt-2" />
                    <SelectContent>
                      {flows.map((flow) => (
                        <SelectItem key={flow.$id} value={flow.$id}>
                          {flow.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {webhookUrl && (
                  <div>
                    <Label className="text-base">Webhook URL</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={webhookUrl}
                        readOnly
                        className="font-mono text-sm bg-muted/50 border-none"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(webhookUrl)}
                        className="transition-transform duration-200 hover:scale-110"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500 animate-pulse-glow" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-base">Payload (JSON)</Label>
                  <textarea
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="w-full h-[260px] mt-2 p-3 rounded-lg border border-input bg-background font-mono text-sm shadow-inner focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                {/* Schema Validation Section */}
                {selectedFlow &&
                  (() => {
                    const nodes = (selectedFlow as any).nodes;
                    const parsedNodes =
                      typeof nodes === "string" ? JSON.parse(nodes) : nodes;
                    const sourceNode = parsedNodes?.find(
                      (node: any) => node.type === "source"
                    );
                    const schema = sourceNode?.data?.config?.schema;

                    if (schema) {
                      let validationResult = null;
                      try {
                        const payload = JSON.parse(testPayload);
                        validationResult = validateSchema(payload, schema);
                      } catch {
                        // Invalid JSON, no schema validation
                      }

                      return (
                        <div>
                          <Label className="text-base">Schema Validation</Label>
                          <div className="mt-2 p-3 rounded-lg border bg-muted/50">
                            <div className="flex items-center gap-2 mb-2">
                              {validationResult ? (
                                validationResult.success ? (
                                  <>
                                    <div className="h-3 w-3 rounded-full bg-green-500" />
                                    <span className="text-sm font-medium text-green-700">
                                      Valid
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <div className="h-3 w-3 rounded-full bg-red-500" />
                                    <span className="text-sm font-medium text-red-700">
                                      Invalid
                                    </span>
                                  </>
                                )
                              ) : (
                                <>
                                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                  <span className="text-sm font-medium text-yellow-700">
                                    Check JSON first
                                  </span>
                                </>
                              )}
                            </div>
                            {validationResult && !validationResult.success && (
                              <div className="text-sm text-red-600 mt-2">
                                {validationResult.error}
                              </div>
                            )}
                            <details className="mt-2">
                              <summary className="text-sm cursor-pointer hover:text-primary">
                                View Expected Schema
                              </summary>
                              <pre className="text-xs mt-2 bg-background p-2 rounded border overflow-auto max-h-32">
                                {JSON.stringify(schema, null, 2)}
                              </pre>
                            </details>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                <Button
                  className="w-full gap-2 text-lg font-semibold py-3 bg-gradient-to-r from-primary to-secondary shadow-lg hover:scale-[1.02] transition-transform"
                  onClick={sendTestWebhook}
                  disabled={sending || !webhookUrl}
                >
                  <Play className="h-5 w-5" />
                  {sending ? "Sending..." : "Send Request"}
                </Button>
              </CardContent>
            </Card>

            {/* Response */}
            <Card className="shadow-xl border-2 border-secondary/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                  Response
                </CardTitle>
                <CardDescription>
                  View the response from your webhook
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base">Status</Label>
                  <div className="mt-2 p-3 rounded-lg border bg-muted flex items-center gap-2">
                    {response ? (
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            response.status >= 200 && response.status < 300
                              ? "bg-green-500 animate-pulse-glow"
                              : "bg-red-500 animate-pulse-glow"
                          }`}
                        />
                        <span className="text-base font-semibold">
                          {response.status} {response.statusText}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow" />
                        <span className="text-base font-semibold">
                          {sending ? "Sending..." : "Ready to send"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-base">Response Body</Label>
                  <div className="mt-2 p-3 rounded-lg border bg-background font-mono text-sm h-[260px] overflow-auto shadow-inner">
                    {response ? (
                      <pre className="text-xs">
                        {JSON.stringify(response.data, null, 2)}
                      </pre>
                    ) : (
                      <pre className="text-muted-foreground">
                        Response will appear here...
                      </pre>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-base">Execution Time</Label>
                  <div className="mt-2 p-3 rounded-lg border bg-muted">
                    <span className="text-base font-semibold">
                      {executionTime !== null ? `${executionTime} ms` : "- ms"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6 animate-fade-in">
          <Card className="shadow-xl border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Test Results
              </CardTitle>
              <CardDescription>
                View data from recent test executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingResults ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">
                    Loading test results...
                  </p>
                </div>
              ) : testResults.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-lg mb-2">No test results yet</p>
                  <p className="text-sm">
                    Send a test webhook to see the processed data here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testResults.map((execution) => (
                    <div key={execution.$id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              execution.status === "completed"
                                ? "bg-green-500"
                                : execution.status === "failed"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }`}
                          />
                          <span className="font-medium">
                            Execution #{execution.$id.slice(-6)}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(execution.$createdAt).toLocaleString()}
                        </span>
                      </div>

                      {execution.node_executions &&
                        execution.node_executions.length > 0 && (
                          <div className="space-y-3">
                            {execution.node_executions
                              .filter(
                                (node: any) =>
                                  node.node_id.includes("destination") &&
                                  node.output?.destination === "test"
                              )
                              .map((node: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-3"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                                      <span className="text-white text-xs">
                                        ✓
                                      </span>
                                    </div>
                                    <span className="font-medium text-blue-900 dark:text-blue-100">
                                      Test Destination Data
                                    </span>
                                  </div>
                                  <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded border overflow-auto max-h-48">
                                    {JSON.stringify(
                                      node.output?.data || node.output,
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              ))}
                          </div>
                        )}

                      {(!execution.node_executions ||
                        execution.node_executions.filter(
                          (node: any) =>
                            node.node_id.includes("destination") &&
                            node.output?.destination === "test"
                        ).length === 0) && (
                        <div className="text-sm text-muted-foreground italic">
                          No test destination data found in this execution
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6 animate-fade-in">
          <div className="space-y-6">
            <div>
              <Label className="text-base">Select Flow to Edit</Label>
              <Select
                value={selectedFlow?.$id}
                onValueChange={(flowId) => {
                  const flow = flows.find((f) => f.$id === flowId);
                  if (flow) handleFlowSelect(flow);
                }}
              >
                <SelectTrigger className="mt-2" />
                <SelectContent>
                  {flows.map((flow) => (
                    <SelectItem key={flow.$id} value={flow.$id}>
                      {flow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedFlow ? (
              <FlowCanvas
                flowId={selectedFlow.$id}
                initialFlow={{
                  ...selectedFlow,
                  nodes:
                    typeof (selectedFlow as any).nodes === "string"
                      ? (selectedFlow as any).nodes
                      : JSON.stringify((selectedFlow as any).nodes || []),
                  edges:
                    typeof (selectedFlow as any).edges === "string"
                      ? (selectedFlow as any).edges
                      : JSON.stringify((selectedFlow as any).edges || []),
                }}
              />
            ) : (
              <Card className="shadow-xl border-2 border-primary/20">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg mb-2">
                      Select a flow to start editing
                    </p>
                    <p className="text-sm">
                      Choose a flow from the dropdown above to edit its
                      structure and configuration.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6 animate-fade-in">
          <Card className="shadow-xl border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                API Reference
              </CardTitle>
              <CardDescription>Explore EventMesh API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-xl bg-muted/40 shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded-full">
                      POST
                    </span>
                    <code className="text-sm">/api/webhook/:webhookId</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Send an event to a specific webhook endpoint
                  </p>
                  <div className="text-xs font-mono bg-muted p-2 rounded-lg">
                    <div>
                      Headers: {"{"} "Content-Type": "application/json" {"}"}
                    </div>
                    <div className="mt-1">Body: JSON payload</div>
                  </div>
                </div>

                <div className="p-4 border rounded-xl bg-muted/40 shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-mono rounded-full">
                      GET
                    </span>
                    <code className="text-sm">/api/flows</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    List all flows in your workspace
                  </p>
                </div>

                <div className="p-4 border rounded-xl bg-muted/40 shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-mono rounded-full">
                      GET
                    </span>
                    <code className="text-sm">/api/events</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    List all events with filtering options
                  </p>
                </div>

                <div className="p-4 border rounded-xl bg-muted/40 shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-mono rounded-full">
                      GET
                    </span>
                    <code className="text-sm">/api/executions</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    List all executions with filtering by flow or event
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
