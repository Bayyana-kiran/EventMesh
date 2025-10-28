"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Check, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";

interface Workspace {
  $id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

interface WorkspaceSelectorProps {
  collapsed?: boolean;
}

export function WorkspaceSelector({
  collapsed = false,
}: WorkspaceSelectorProps) {
  const { user, workspace, workspaces, switchWorkspace, refreshWorkspaces } =
    useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim() || !user?.$id) return;

    try {
      setCreating(true);
      const response = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWorkspaceName,
          userId: user.$id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh workspaces list from AuthContext
        await refreshWorkspaces();
        setNewWorkspaceName("");
        setIsCreating(false);
        setIsOpen(false);

        // Switch to the new workspace
        if (data.workspace) {
          await switchWorkspace(data.workspace.$id);
        }
      } else {
        alert(data.error || "Failed to create workspace");
      }
    } catch (error) {
      console.error("Failed to create workspace:", error);
      alert("Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  const handleSwitchWorkspace = async (workspaceId: string) => {
    try {
      await switchWorkspace(workspaceId);
      setIsOpen(false);
      // Reload the page to refresh all workspace-specific data
      window.location.reload();
    } catch (error) {
      console.error("Failed to switch workspace:", error);
    }
  };

  if (collapsed) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="w-full flex justify-center group p-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
          </button>
        </DialogTrigger>
        <WorkspaceDialogContent
          workspaces={workspaces}
          currentWorkspace={workspace}
          isCreating={isCreating}
          newWorkspaceName={newWorkspaceName}
          creating={creating}
          setIsCreating={setIsCreating}
          setNewWorkspaceName={setNewWorkspaceName}
          handleSwitchWorkspace={handleSwitchWorkspace}
          handleCreateWorkspace={handleCreateWorkspace}
        />
      </Dialog>
    );
  }

  return (
    <div className="relative p-3 border-b border-border/50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="w-full group relative overflow-hidden rounded-lg border border-border/50 bg-muted/50 p-3 text-left transition-all hover:border-primary/50 hover:bg-muted">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {workspace?.name || "My Workspace"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {workspaces.length} workspace
                  {workspaces.length !== 1 ? "s" : ""}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </div>
          </button>
        </DialogTrigger>
        <WorkspaceDialogContent
          workspaces={workspaces}
          currentWorkspace={workspace}
          isCreating={isCreating}
          newWorkspaceName={newWorkspaceName}
          creating={creating}
          setIsCreating={setIsCreating}
          setNewWorkspaceName={setNewWorkspaceName}
          handleSwitchWorkspace={handleSwitchWorkspace}
          handleCreateWorkspace={handleCreateWorkspace}
        />
      </Dialog>
    </div>
  );
}

function WorkspaceDialogContent({
  workspaces,
  currentWorkspace,
  isCreating,
  newWorkspaceName,
  creating,
  setIsCreating,
  setNewWorkspaceName,
  handleSwitchWorkspace,
  handleCreateWorkspace,
}: {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isCreating: boolean;
  newWorkspaceName: string;
  creating: boolean;
  setIsCreating: (value: boolean) => void;
  setNewWorkspaceName: (value: string) => void;
  handleSwitchWorkspace: (id: string) => void;
  handleCreateWorkspace: () => void;
}) {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {isCreating ? "Create New Workspace" : "Switch Workspace"}
        </DialogTitle>
        <DialogDescription>
          {isCreating
            ? "Create a new workspace to organize your flows and events."
            : "Select a workspace or create a new one."}
        </DialogDescription>
      </DialogHeader>

      {isCreating ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input
              id="workspace-name"
              placeholder="My Awesome Project"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newWorkspaceName.trim()) {
                  handleCreateWorkspace();
                }
              }}
              disabled={creating}
              autoFocus
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewWorkspaceName("");
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkspace}
              disabled={!newWorkspaceName.trim() || creating}
              className="gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Workspace
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {workspaces.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No workspaces found</p>
              </div>
            ) : (
              workspaces.map((workspace) => (
                <button
                  key={workspace.$id}
                  onClick={() => handleSwitchWorkspace(workspace.$id)}
                  className={cn(
                    "w-full group relative overflow-hidden rounded-lg border p-3 text-left transition-all",
                    currentWorkspace?.$id === workspace.$id
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/50 hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                        currentWorkspace?.$id === workspace.$id
                          ? "from-primary/20 to-secondary/20"
                          : "from-muted to-muted/50"
                      )}
                    >
                      <Building2
                        className={cn(
                          "h-5 w-5",
                          currentWorkspace?.$id === workspace.$id
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{workspace.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Created{" "}
                        {new Date(workspace.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {currentWorkspace?.$id === workspace.$id && (
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <Button
            onClick={() => setIsCreating(true)}
            variant="outline"
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Workspace
          </Button>
        </div>
      )}
    </DialogContent>
  );
}
