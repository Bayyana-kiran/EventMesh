"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Save, Code, Webhook, Send } from "lucide-react";

interface NodeConfigPanelProps {
  node: any;
  onUpdate: (data: any) => void;
  onDelete?: (nodeId: string) => void;
  onClose: () => void;
}

export function NodeConfigPanel({
  node,
  onUpdate,
  onDelete,
  onClose,
}: NodeConfigPanelProps) {
  const [config, setConfig] = useState<any>(node.data);

  useEffect(() => {
    setConfig(node.data);
  }, [node]);

  const handleSave = () => {
    onUpdate(config);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(node.id);
    }
    onClose();
  };

  const getIcon = () => {
    switch (node.type) {
      case "source":
        return <Webhook className="h-5 w-5" />;
      case "transform":
        return <Code className="h-5 w-5" />;
      case "destination":
        return <Send className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (node.type) {
      case "source":
        return "Source Configuration";
      case "transform":
        return "Transform Configuration";
      case "destination":
        return "Destination Configuration";
      default:
        return "Node Configuration";
    }
  };

  return (
    <Card className="w-96 absolute top-4 right-4 shadow-lg z-50 max-h-[calc(100vh-120px)] overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          {getIcon()}
          {getTitle()}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source Node Configuration */}
        {node.type === "source" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Node Label</Label>
              <Input
                id="label"
                value={config.label || ""}
                onChange={(e) =>
                  setConfig({ ...config, label: e.target.value })
                }
                placeholder="e.g., GitHub Webhook"
              />
            </div>
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="text-xs font-mono bg-muted p-3 rounded-md break-all">
                {config.webhookUrl || "Not configured"}
              </div>
              <p className="text-xs text-muted-foreground">
                Send POST requests to this URL to trigger the flow
              </p>
            </div>
          </div>
        )}

        {/* Transform Node Configuration */}
        {node.type === "transform" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Node Label</Label>
              <Input
                id="label"
                value={config.label || ""}
                onChange={(e) =>
                  setConfig({ ...config, label: e.target.value })
                }
                placeholder="e.g., Add Timestamp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Transform Type</Label>
              <Select
                value={config.type || "javascript"}
                onValueChange={(value) => setConfig({ ...config, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transform type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="ai">AI (Gemini)</SelectItem>
                  <SelectItem value="passthrough">Pass-through</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.type === "javascript" && (
              <div className="space-y-2">
                <Label htmlFor="code">JavaScript Code</Label>
                <Textarea
                  id="code"
                  value={config.code || ""}
                  onChange={(e) =>
                    setConfig({ ...config, code: e.target.value })
                  }
                  placeholder="// Transform the data&#10;return {&#10;  ...data,&#10;  timestamp: new Date().toISOString()&#10;};"
                  className="font-mono text-sm h-48"
                />
                <p className="text-xs text-muted-foreground">
                  Input data is available as{" "}
                  <code className="bg-muted px-1 rounded">data</code>. Return
                  the transformed data.
                </p>
                <div className="bg-muted p-3 rounded-md text-xs space-y-1">
                  <p className="font-semibold">Example:</p>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {`// Add metadata
return {
  ...data,
  processed_at: new Date().toISOString(),
  source: "EventMesh"
};`}
                  </pre>
                </div>
              </div>
            )}

            {config.type === "ai" && (
              <div className="space-y-2">
                <Label htmlFor="prompt">AI Prompt</Label>
                <Textarea
                  id="prompt"
                  value={config.prompt || ""}
                  onChange={(e) =>
                    setConfig({ ...config, prompt: e.target.value })
                  }
                  placeholder="Describe how to transform the data...&#10;e.g., Extract key information and summarize it"
                  className="h-32"
                />
                <p className="text-xs text-muted-foreground">
                  Gemini AI will transform the data based on this prompt
                </p>
              </div>
            )}
          </div>
        )}

        {/* Destination Node Configuration */}
        {node.type === "destination" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Node Label</Label>
              <Input
                id="label"
                value={config.label || ""}
                onChange={(e) =>
                  setConfig({ ...config, label: e.target.value })
                }
                placeholder="e.g., Send to Slack"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Destination Type</Label>
              <Select
                value={config.type || "webhook"}
                onValueChange={(value) => setConfig({ ...config, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="test">Test (Log Data)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.type === "slack" && (
              <div className="space-y-2">
                <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                <Input
                  id="slackWebhook"
                  type="url"
                  value={config.slackWebhook || ""}
                  onChange={(e) =>
                    setConfig({ ...config, slackWebhook: e.target.value })
                  }
                  placeholder="https://hooks.slack.com/services/..."
                />
                <p className="text-xs text-muted-foreground">
                  Get this from Slack: Apps → Incoming Webhooks
                </p>
              </div>
            )}

            {config.type === "discord" && (
              <div className="space-y-2">
                <Label htmlFor="discordWebhook">Discord Webhook URL</Label>
                <Input
                  id="discordWebhook"
                  type="url"
                  value={config.discordWebhook || ""}
                  onChange={(e) =>
                    setConfig({ ...config, discordWebhook: e.target.value })
                  }
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <p className="text-xs text-muted-foreground">
                  Get from Discord: Server Settings → Integrations → Webhooks
                </p>
              </div>
            )}

            {config.type === "webhook" && (
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  value={config.webhookUrl || config.url || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      webhookUrl: e.target.value,
                      url: e.target.value,
                    })
                  }
                  placeholder="https://api.example.com/webhook"
                />
                <p className="text-xs text-muted-foreground">
                  Data will be sent as JSON POST request
                </p>
                {/* Test endpoint removed: use a real webhook URL (e.g. /api/webhook/{webhook_id}) */}
              </div>
            )}

            {config.type === "test" && (
              <div className="space-y-2">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      Test Destination
                    </span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This destination logs all incoming data to the console for
                    testing purposes. No external service is contacted. Perfect
                    for debugging and validating your flow.
                  </p>
                  <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                    <strong>Logged data will appear in:</strong> Server console
                    logs
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSave} className="flex-1 gap-2">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>

          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>

          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
