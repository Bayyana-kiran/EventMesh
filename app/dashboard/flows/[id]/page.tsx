"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FlowCanvas from "@/components/flow/FlowCanvas";
import { useToast } from "@/lib/hooks/use-toast";
import { ArrowLeft, Loader2, Settings, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function FlowBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [flow, setFlow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [executions, setExecutions] = useState<any[]>([]);
  const [executionsLoading, setExecutionsLoading] = useState(false);

  const flowId = params.id as string;

  useEffect(() => {
    const loadFlow = async () => {
      try {
        const response = await fetch(`/api/flows/${flowId}`);
        if (!response.ok) {
          throw new Error("Failed to load flow");
        }
        const data = await response.json();
        setFlow(data);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        toast({
          title: "Error",
          description: errorMessage || "Failed to load flow",
          variant: "destructive",
        });
        router.push("/dashboard/flows");
      } finally {
        setLoading(false);
      }
    };

    loadFlow();
  }, [flowId, router, toast]);

  useEffect(() => {
    const loadExecutions = async () => {
      if (!flowId) return;

      try {
        setExecutionsLoading(true);
        const response = await fetch(
          `/api/executions?flowId=${flowId}&limit=5`
        );
        if (!response.ok) {
          throw new Error("Failed to load executions");
        }
        const data = await response.json();
        setExecutions(data.executions || []);
      } catch (error: unknown) {
        console.error("Failed to load executions:", error);
      } finally {
        setExecutionsLoading(false);
      }
    };

    loadExecutions();

    // Refresh executions every 5 seconds
    const interval = setInterval(loadExecutions, 5000);
    return () => clearInterval(interval);
  }, [flowId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!flow) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/flows">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{flow.name}</h1>
              {flow.description && (
                <p className="text-muted-foreground mt-2">{flow.description}</p>
              )}
            </div>
          </div>
        </div>
        <Badge variant={flow.status === "active" ? "default" : "secondary"}>
          {flow.status}
        </Badge>
      </div>

      {/* Flow Canvas */}
      <FlowCanvas flowId={flowId} initialFlow={flow} />

      {/* Configuration Section */}
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
              {executionsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin" />
                  <p>Loading executions...</p>
                </div>
              ) : executions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No executions yet</p>
                  <p className="text-sm mt-1">
                    Webhook URL:{" "}
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {flow.webhook_url}
                    </code>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {executions.map((execution) => (
                    <div
                      key={execution.$id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            execution.status === "completed"
                              ? "bg-green-500"
                              : execution.status === "failed"
                              ? "bg-red-500"
                              : execution.status === "running"
                              ? "bg-blue-500 animate-pulse"
                              : "bg-yellow-500"
                          }`}
                        />
                        <div>
                          <div className="text-sm font-medium">
                            Execution #{execution.$id.slice(-6)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(execution.$createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          execution.status === "completed"
                            ? "default"
                            : execution.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {execution.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
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
                    <Input id="flow-name" defaultValue={flow.name} readOnly />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      defaultValue={flow.description || ""}
                      readOnly
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                      {flow.webhook_url}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          flow.status === "active" ? "bg-primary" : "bg-muted"
                        }`}
                      />
                      <span className="text-sm capitalize">{flow.status}</span>
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

                  <Button className="w-full mt-4" disabled>
                    Save Settings
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
