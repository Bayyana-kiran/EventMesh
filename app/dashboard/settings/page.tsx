"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Bell,
  Mail,
  Monitor,
  Webhook,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/lib/hooks/use-toast";
import { useAuth } from "@/lib/auth/AuthContext";
import { Spinner } from "@/components/ui/loading";

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const { workspace, workspaces, deleteWorkspace } = useAuth();
  const [_apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [workspaceSettings, setWorkspaceSettings] = useState<any>({});
  const [notifications, setNotifications] = useState<any>({
    email: {
      enabled: false,
      recipients: [],
      flowFailures: false,
      eventVolume: { enabled: false, threshold: 1000 },
      weeklyReports: false,
    },
    inApp: {
      enabled: true,
      flowFailures: true,
      eventVolume: { enabled: true, threshold: 1000 },
      weeklyReports: true,
    },
    webhook: {
      enabled: false,
      url: "",
      flowFailures: false,
      eventVolume: { enabled: false, threshold: null },
      weeklyReports: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    if (!workspace) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/workspace/settings?workspaceId=${workspace.$id}`
      );
      const data = await response.json();

      if (data.success) {
        setApiKeys(data.apiKeys || []);
        // parse settings from workspace (may be JSON string)
        let settingsObj: any = {};
        try {
          settingsObj = data.workspace?.settings
            ? typeof data.workspace.settings === "string"
              ? JSON.parse(data.workspace.settings)
              : data.workspace.settings
            : {};
        } catch {
          settingsObj = data.workspace?.settings || {};
        }
        setWorkspaceSettings(settingsObj);
        if (settingsObj.notifications)
          setNotifications(settingsObj.notifications);
      }
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: (err as Error).message || "Failed to fetch settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [workspace, toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (workspace) {
      setWorkspaceName(workspace.name);
    }
  }, [workspace]);

  const handleSaveWorkspace = async () => {
    if (!workspace || !workspaceName.trim()) return;

    setSaving(true);
    try {
      const response = await fetch("/api/workspace/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.$id,
          name: workspaceName,
          // preserve other settings and merge notifications
          settings: {
            ...workspaceSettings,
            notifications,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Workspace settings updated",
        });
        router.refresh();
      } else {
        throw new Error(data.error);
      }
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: (err as Error).message || "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!workspace) return;
    setSaving(true);
    try {
      const response = await fetch("/api/workspace/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.$id,
          settings: {
            ...workspaceSettings,
            notifications,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Notification settings updated",
        });
        // update local cache
        setWorkspaceSettings((s: any) => ({ ...s, notifications }));
      } else {
        throw new Error(data.error || "Failed to save notifications");
      }
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: (err as Error).message || "Failed to save",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspace || deleteConfirmation !== "DELETE") {
      toast({
        title: "Invalid confirmation",
        description: "Please type DELETE to confirm",
        variant: "destructive",
      });
      return;
    }

    setDeleting(true);
    try {
      await deleteWorkspace(workspace.$id, deleteConfirmation);

      toast({
        title: "Workspace deleted",
        description:
          "Your workspace and all data have been permanently deleted",
      });

      setShowDeleteDialog(false);
      setDeleteConfirmation("");

      // If there are other workspaces, stay in the app
      // Otherwise, redirect to dashboard (will show empty state)
      if (workspaces.length > 1) {
        router.refresh();
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: (err as Error).message || "Failed to delete workspace",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and workspace settings
        </p>
      </div>

      <Tabs defaultValue="workspace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="workspace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>
                Manage your workspace configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="My Workspace"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-id">Workspace ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="workspace-id"
                    value={workspace?.$id || ""}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      copyToClipboard(workspace?.$id || "", "workspace")
                    }
                  >
                    {copiedKey === "workspace" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Created</Label>
                <div className="text-sm text-muted-foreground">
                  {workspace?.created_at
                    ? new Date(workspace.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "-"}
                </div>
              </div>
              <Button onClick={handleSaveWorkspace} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Deleting your workspace will permanently remove all flows,
                events, executions, destinations, API keys, and analytics. This
                action cannot be undone.
              </p>
              {workspaces.length <= 1 && (
                <p className="text-sm text-amber-600 dark:text-amber-500 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  You cannot delete your only workspace. Create another
                  workspace first.
                </p>
              )}
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={!workspace || workspaces.length <= 1}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Workspace
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {/* Page header with gradient */}
          <div className="relative">
            {/* Subtle glow effect */}
            <div className="absolute -top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Notification Preferences
                </h2>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Bell className="h-3 w-3" />
                  <span>Live</span>
                </div>
              </div>
              <p className="text-muted-foreground text-base">
                Configure how you receive notifications about your event flows.
              </p>
            </div>
          </div>

          {/* Notification channels grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Email Notifications */}
            <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Email</CardTitle>
                    <CardDescription>
                      Send notifications via email
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {/* Enable toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-purple-500/30 transition-colors">
                  <div>
                    <div className="font-medium">
                      Enable Email Notifications
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications by email
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!notifications.email?.enabled}
                      onChange={(e) =>
                        setNotifications((s: any) => ({
                          ...s,
                          email: { ...s.email, enabled: e.target.checked },
                        }))
                      }
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>

                {notifications.email?.enabled && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {/* Recipients */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Recipients</Label>
                      <Input
                        value={(notifications.email?.recipients || []).join(
                          ", "
                        )}
                        onChange={(e) =>
                          setNotifications((s: any) => ({
                            ...s,
                            email: {
                              ...s.email,
                              recipients: e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean),
                            },
                          }))
                        }
                        placeholder="user@example.com, admin@example.com"
                        className="transition-all focus:border-purple-500/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate multiple emails with commas
                      </p>
                    </div>

                    {/* Notification types */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Notify me about:
                      </Label>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-purple-500/30 transition-colors">
                        <div>
                          <div className="font-medium text-sm">
                            Flow Failures
                          </div>
                          <div className="text-xs text-muted-foreground">
                            When flows fail to execute
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!!notifications.email?.flowFailures}
                            onChange={(e) =>
                              setNotifications((s: any) => ({
                                ...s,
                                email: {
                                  ...s.email,
                                  flowFailures: e.target.checked,
                                },
                              }))
                            }
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-purple-500/30 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            High Event Volume
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            When events exceed threshold
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={
                                notifications.email?.eventVolume?.threshold ??
                                1000
                              }
                              onChange={(e) =>
                                setNotifications((s: any) => ({
                                  ...s,
                                  email: {
                                    ...s.email,
                                    eventVolume: {
                                      ...(s.email?.eventVolume || {}),
                                      threshold: Number(e.target.value),
                                    },
                                  },
                                }))
                              }
                              className="w-20 h-8 text-xs transition-all focus:border-purple-500/50"
                              min="1"
                            />
                            <span className="text-xs text-muted-foreground">
                              events/hour
                            </span>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-3">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={
                              !!notifications.email?.eventVolume?.enabled
                            }
                            onChange={(e) =>
                              setNotifications((s: any) => ({
                                ...s,
                                email: {
                                  ...s.email,
                                  eventVolume: {
                                    ...(s.email?.eventVolume || {}),
                                    enabled: e.target.checked,
                                  },
                                },
                              }))
                            }
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-purple-500/30 transition-colors">
                        <div>
                          <div className="font-medium text-sm">
                            Weekly Reports
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Analytics summary every week
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!!notifications.email?.weeklyReports}
                            onChange={(e) =>
                              setNotifications((s: any) => ({
                                ...s,
                                email: {
                                  ...s.email,
                                  weeklyReports: e.target.checked,
                                },
                              }))
                            }
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* In-App Notifications */}
            <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Monitor className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">In-App</CardTitle>
                    <CardDescription>
                      Show notifications in EventMesh
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {/* Enable toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-green-500/30 transition-colors">
                  <div>
                    <div className="font-medium">
                      Enable In-App Notifications
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Show notifications in the dashboard
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!notifications.inApp?.enabled}
                      onChange={(e) =>
                        setNotifications((s: any) => ({
                          ...s,
                          inApp: { ...s.inApp, enabled: e.target.checked },
                        }))
                      }
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {notifications.inApp?.enabled && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {/* Notification types */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Notify me about:
                      </Label>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-green-500/30 transition-colors">
                        <div>
                          <div className="font-medium text-sm">
                            Flow Failures
                          </div>
                          <div className="text-xs text-muted-foreground">
                            When flows fail to execute
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!!notifications.inApp?.flowFailures}
                            onChange={(e) =>
                              setNotifications((s: any) => ({
                                ...s,
                                inApp: {
                                  ...s.inApp,
                                  flowFailures: e.target.checked,
                                },
                              }))
                            }
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-green-500/30 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            High Event Volume
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            When events exceed threshold
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={
                                notifications.inApp?.eventVolume?.threshold ??
                                1000
                              }
                              onChange={(e) =>
                                setNotifications((s: any) => ({
                                  ...s,
                                  inApp: {
                                    ...s.inApp,
                                    eventVolume: {
                                      ...(s.inApp?.eventVolume || {}),
                                      threshold: Number(e.target.value),
                                    },
                                  },
                                }))
                              }
                              className="w-20 h-8 text-xs transition-all focus:border-green-500/50"
                              min="1"
                            />
                            <span className="text-xs text-muted-foreground">
                              events/hour
                            </span>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-3">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={
                              !!notifications.inApp?.eventVolume?.enabled
                            }
                            onChange={(e) =>
                              setNotifications((s: any) => ({
                                ...s,
                                inApp: {
                                  ...s.inApp,
                                  eventVolume: {
                                    ...(s.inApp?.eventVolume || {}),
                                    enabled: e.target.checked,
                                  },
                                },
                              }))
                            }
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-green-500/30 transition-colors">
                        <div>
                          <div className="font-medium text-sm">
                            Weekly Reports
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Analytics summary every week
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!!notifications.inApp?.weeklyReports}
                            onChange={(e) =>
                              setNotifications((s: any) => ({
                                ...s,
                                inApp: {
                                  ...s.inApp,
                                  weeklyReports: e.target.checked,
                                },
                              }))
                            }
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Webhook Notifications */}
            <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Webhook className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Webhook</CardTitle>
                    <CardDescription>
                      Forward notifications to external services
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {/* Enable toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-blue-500/30 transition-colors">
                  <div>
                    <div className="font-medium">
                      Enable Webhook Notifications
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Send notifications to a webhook URL
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!notifications.webhook?.enabled}
                      onChange={(e) =>
                        setNotifications((s: any) => ({
                          ...s,
                          webhook: {
                            ...s.webhook,
                            enabled: e.target.checked,
                          },
                        }))
                      }
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                {notifications.webhook?.enabled && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {/* Webhook URL */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Webhook URL</Label>
                      <Input
                        value={notifications.webhook?.url || ""}
                        onChange={(e) =>
                          setNotifications((s: any) => ({
                            ...s,
                            webhook: { ...s.webhook, url: e.target.value },
                          }))
                        }
                        placeholder="https://api.example.com/webhooks/notifications"
                        className="transition-all focus:border-blue-500/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll POST notification data to this URL
                      </p>
                    </div>

                    {/* Notification types */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Notify about:
                      </Label>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-blue-500/30 transition-colors">
                        <div>
                          <div className="font-medium text-sm">
                            Flow Failures
                          </div>
                          <div className="text-xs text-muted-foreground">
                            When flows fail to execute
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!!notifications.webhook?.flowFailures}
                            onChange={(e) =>
                              setNotifications((s: any) => ({
                                ...s,
                                webhook: {
                                  ...s.webhook,
                                  flowFailures: e.target.checked,
                                },
                              }))
                            }
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-blue-500/30 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            High Event Volume
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            When events exceed threshold
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={
                                notifications.webhook?.eventVolume?.threshold ??
                                1000
                              }
                              onChange={(e) =>
                                setNotifications((s: any) => ({
                                  ...s,
                                  webhook: {
                                    ...s.webhook,
                                    eventVolume: {
                                      ...(s.webhook?.eventVolume || {}),
                                      threshold: Number(e.target.value),
                                    },
                                  },
                                }))
                              }
                              className="w-20 h-8 text-xs transition-all focus:border-blue-500/50"
                              min="1"
                            />
                            <span className="text-xs text-muted-foreground">
                              events/hour
                            </span>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-3">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={
                              !!notifications.webhook?.eventVolume?.enabled
                            }
                            onChange={(e) =>
                              setNotifications((s: any) => ({
                                ...s,
                                webhook: {
                                  ...s.webhook,
                                  eventVolume: {
                                    ...(s.webhook?.eventVolume || {}),
                                    enabled: e.target.checked,
                                  },
                                },
                              }))
                            }
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-blue-500/30 transition-colors">
                        <div>
                          <div className="font-medium text-sm">
                            Weekly Reports
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Analytics summary every week
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!!notifications.webhook?.weeklyReports}
                            onChange={(e) =>
                              setNotifications((s: any) => ({
                                ...s,
                                webhook: {
                                  ...s.webhook,
                                  weeklyReports: e.target.checked,
                                },
                              }))
                            }
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-6">
            <Button
              onClick={handleSaveNotifications}
              disabled={saving}
              className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              {saving ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Notification Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Workspace
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              This action will permanently delete the workspace{" "}
              <strong className="text-foreground">{workspace?.name}</strong> and
              all associated data:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>All flows and transformations</li>
              <li>All event history</li>
              <li>All execution logs</li>
              <li>All destinations</li>
              <li>All API keys</li>
              <li>All analytics data</li>
            </ul>
            <p className="font-semibold text-destructive">
              This action cannot be undone.
            </p>
          </div>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Type <span className="font-mono font-bold">DELETE</span> to
                confirm
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmation("");
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWorkspace}
              disabled={deleteConfirmation !== "DELETE" || deleting}
            >
              {deleting ? (
                <>
                  <Spinner className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Workspace
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
