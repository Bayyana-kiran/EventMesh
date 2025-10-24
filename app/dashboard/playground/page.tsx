"use client";

import { useState } from "react";
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
import { Copy, Play, Code } from "lucide-react";

export default function PlaygroundPage() {
  const [webhookUrl] = useState("https://api.eventmesh.dev/webhooks/abc123xyz");
  const [testPayload, setTestPayload] = useState(`{
  "event": "user.created",
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}`);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
          <TabsTrigger value="transform">Transformation Tester</TabsTrigger>
          <TabsTrigger value="api">API Explorer</TabsTrigger>
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
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Payload (JSON)</Label>
                  <textarea
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="w-full h-[300px] mt-2 p-3 rounded-md border bg-background font-mono text-sm"
                  />
                </div>

                <Button className="w-full gap-2">
                  <Play className="h-4 w-4" />
                  Send Request
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
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm font-medium">Ready to send</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Response Body</Label>
                  <div className="mt-2 p-3 rounded-md border bg-background font-mono text-sm h-[300px] overflow-auto">
                    <pre className="text-muted-foreground">
                      Response will appear here...
                    </pre>
                  </div>
                </div>

                <div>
                  <Label>Execution Time</Label>
                  <div className="mt-2 p-3 rounded-md border bg-muted">
                    <span className="text-sm font-medium">- ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transform" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Transformations</CardTitle>
              <CardDescription>
                Test your JavaScript or AI transformations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label>Input Payload</Label>
                  <textarea
                    className="w-full h-[200px] mt-2 p-3 rounded-md border bg-background font-mono text-sm"
                    placeholder='{"key": "value"}'
                  />
                </div>
                <div>
                  <Label>Output Payload</Label>
                  <div className="w-full h-[200px] mt-2 p-3 rounded-md border bg-muted font-mono text-sm overflow-auto">
                    <pre className="text-muted-foreground">
                      Transform output will appear here...
                    </pre>
                  </div>
                </div>
              </div>

              <div>
                <Label>Transformation Code (JavaScript)</Label>
                <textarea
                  className="w-full h-[200px] mt-2 p-3 rounded-md border bg-background font-mono text-sm"
                  placeholder="// Transform the payload&#10;return { ...payload, transformed: true }"
                />
              </div>

              <Button className="gap-2">
                <Code className="h-4 w-4" />
                Run Transformation
              </Button>
            </CardContent>
          </Card>
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
                    <code className="text-sm">/api/webhooks/:id</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Send an event to a specific webhook endpoint
                  </p>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
