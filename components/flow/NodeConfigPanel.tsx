"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";

interface NodeConfigPanelProps {
  node: any;
  onUpdate: (data: any) => void;
  onClose: () => void;
}

export function NodeConfigPanel({
  node,
  onUpdate,
  onClose,
}: NodeConfigPanelProps) {
  const [config, setConfig] = useState(node.data);

  const handleSave = () => {
    onUpdate(config);
    onClose();
  };

  return (
    <Card className="w-80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Configure Node</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source Node Configuration */}
        {node.type === "source" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={config.label}
                onChange={(e) =>
                  setConfig({ ...config, label: e.target.value })
                }
                placeholder="Webhook name"
              />
            </div>
            <div>
              <Label>Webhook URL</Label>
              <div className="mt-2 p-3 rounded-md bg-muted font-mono text-xs break-all">
                {config.webhookUrl || "Will be generated after saving"}
              </div>
            </div>
          </div>
        )}

        {/* Transform Node Configuration */}
        {node.type === "transform" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={config.label}
                onChange={(e) =>
                  setConfig({ ...config, label: e.target.value })
                }
                placeholder="Transform name"
              />
            </div>

            <Tabs
              value={config.type}
              onValueChange={(value) => setConfig({ ...config, type: value })}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="ai">AI Transform</TabsTrigger>
              </TabsList>

              <TabsContent value="javascript" className="space-y-2">
                <Label>Transformation Code</Label>
                <textarea
                  className="w-full h-32 p-2 rounded-md border bg-background font-mono text-xs"
                  value={config.code || ""}
                  onChange={(e) =>
                    setConfig({ ...config, code: e.target.value })
                  }
                  placeholder="// Transform the payload&#10;return { ...payload, transformed: true }"
                />
              </TabsContent>

              <TabsContent value="ai" className="space-y-2">
                <Label>AI Prompt</Label>
                <textarea
                  className="w-full h-32 p-2 rounded-md border bg-background text-sm"
                  value={config.prompt || ""}
                  onChange={(e) =>
                    setConfig({ ...config, prompt: e.target.value })
                  }
                  placeholder="Describe how to transform the data..."
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Destination Node Configuration */}
        {node.type === "destination" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={config.label}
                onChange={(e) =>
                  setConfig({ ...config, label: e.target.value })
                }
                placeholder="Destination name"
              />
            </div>

            <div>
              <Label htmlFor="type">Destination Type</Label>
              <select
                id="type"
                className="w-full mt-1 p-2 rounded-md border bg-background"
                value={config.type}
                onChange={(e) => setConfig({ ...config, type: e.target.value })}
              >
                <option value="slack">Slack</option>
                <option value="discord">Discord</option>
                <option value="webhook">Custom Webhook</option>
                <option value="email">Email</option>
              </select>
            </div>

            {config.type === "slack" && (
              <div>
                <Label htmlFor="webhookUrl">Slack Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  value={config.webhookUrl || ""}
                  onChange={(e) =>
                    setConfig({ ...config, webhookUrl: e.target.value })
                  }
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>
            )}

            {config.type === "discord" && (
              <div>
                <Label htmlFor="webhookUrl">Discord Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  value={config.webhookUrl || ""}
                  onChange={(e) =>
                    setConfig({ ...config, webhookUrl: e.target.value })
                  }
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </div>
            )}

            {config.type === "webhook" && (
              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  value={config.webhookUrl || ""}
                  onChange={(e) =>
                    setConfig({ ...config, webhookUrl: e.target.value })
                  }
                  placeholder="https://api.example.com/webhook"
                />
              </div>
            )}

            {config.type === "email" && (
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email || ""}
                  onChange={(e) =>
                    setConfig({ ...config, email: e.target.value })
                  }
                  placeholder="notifications@example.com"
                />
              </div>
            )}
          </div>
        )}

        <Button onClick={handleSave} className="w-full">
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
}
