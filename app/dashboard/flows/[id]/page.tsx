import FlowCanvas from "@/components/flow/FlowCanvas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code, Settings, Activity } from "lucide-react";

export default function FlowBuilderPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          GitHub to Slack Flow
        </h1>
        <p className="text-muted-foreground mt-2">
          Route GitHub push events to your Slack channel
        </p>
      </div>

      {/* Flow Canvas */}
      <FlowCanvas />

      {/* Configuration Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Flow Execution Log
              </CardTitle>
              <CardDescription>Recent executions of this flow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "2 min ago", status: "success", duration: "245ms" },
                  { time: "5 min ago", status: "success", duration: "198ms" },
                  { time: "12 min ago", status: "failed", duration: "1.2s" },
                ].map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          log.status === "success"
                            ? "bg-primary"
                            : "bg-destructive"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">{log.time}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.duration}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Flow Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="flow-name">Flow Name</Label>
                    <Input id="flow-name" defaultValue="GitHub to Slack Flow" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      defaultValue="Route GitHub events"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm">Active</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Retry Logic</Label>
                    <Input type="number" defaultValue="3" />
                  </div>

                  <div className="space-y-2">
                    <Label>Timeout (ms)</Label>
                    <Input type="number" defaultValue="5000" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
