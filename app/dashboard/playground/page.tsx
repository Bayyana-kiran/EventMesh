"use client";

import { useState, useEffect } from "react";
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
import { Copy, Play, Code, Check } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Flow {
  $id: string;
  name: string;
  webhook_id: string;
}

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
  const { toast } = useToast();

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      const res = await fetch("/api/flows");
      const data = await res.json();
      if (data.success) {
        setFlows(data.flows);
        if (data.flows.length > 0) {
          handleFlowSelect(data.flows[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching flows:", error);
    }
  };

  const handleFlowSelect = (flow: Flow) => {
    setSelectedFlow(flow);
    const url = `${window.location.origin}/api/webhook/${flow.webhook_id}`;
    setWebhookUrl(url);
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

    try {
      // Validate JSON
      JSON.parse(testPayload);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your payload syntax",
        variant: "destructive",
      });
      return;
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
        body: testPayload,
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
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send webhook",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      setResponse({
        status: 0,
        statusText: "Network Error",
        data: { error: errorMessage },
      });
      toast({
        title: "Error",
        description: error.message || "Failed to send webhook",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Playground</h1>
        <p className="text-muted-foreground mt-2">
          Test your webhooks and transformations
        </p>
      </div>

      <Tabs defaultValue="webhook" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhook">Webhook Tester</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="webhook" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request */}
            <Card>
              <CardHeader>
                <CardTitle>Send Test Webhook</CardTitle>
                <CardDescription>
                  Test your webhook endpoint with custom payloads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Flow</Label>
                  <Select
                    value={selectedFlow?.$id}
                    onValueChange={(flowId) => {
                      const flow = flows.find((f) => f.$id === flowId);
                      if (flow) handleFlowSelect(flow);
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a flow to test" />
                    </SelectTrigger>
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
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={webhookUrl}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(webhookUrl)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Payload (JSON)</Label>
                  <textarea
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="w-full h-[300px] mt-2 p-3 rounded-md border bg-background font-mono text-sm"
                  />
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={sendTestWebhook}
                  disabled={sending || !webhookUrl}
                >
                  <Play className="h-4 w-4" />
                  {sending ? "Sending..." : "Send Request"}
                </Button>
              </CardContent>
            </Card>

            {/* Response */}
            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
                <CardDescription>
                  View the response from your webhook
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-2 p-3 rounded-md border bg-muted">
                    {response ? (
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            response.status >= 200 && response.status < 300
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {response.status} {response.statusText}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-sm font-medium">
                          {sending ? "Sending..." : "Ready to send"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Response Body</Label>
                  <div className="mt-2 p-3 rounded-md border bg-background font-mono text-sm h-[300px] overflow-auto">
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
                  <Label>Execution Time</Label>
                  <div className="mt-2 p-3 rounded-md border bg-muted">
                    <span className="text-sm font-medium">
                      {executionTime !== null ? `${executionTime} ms` : "- ms"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>Explore EventMesh API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded">
                      POST
                    </span>
                    <code className="text-sm">/api/webhook/:webhookId</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Send an event to a specific webhook endpoint
                  </p>
                  <div className="text-xs font-mono bg-muted p-2 rounded">
                    <div>
                      Headers: {"{"} "Content-Type": "application/json" {"}"}
                    </div>
                    <div className="mt-1">Body: JSON payload</div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-mono rounded">
                      GET
                    </span>
                    <code className="text-sm">/api/flows</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    List all flows in your workspace
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-mono rounded">
                      GET
                    </span>
                    <code className="text-sm">/api/events</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    List all events with filtering options
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-mono rounded">
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
