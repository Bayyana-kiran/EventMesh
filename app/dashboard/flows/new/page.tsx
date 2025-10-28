"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCreateFlow } from "@/lib/hooks/useFlows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/hooks/use-toast";

export default function NewFlowPage() {
  const router = useRouter();
  const { workspace } = useAuth();
  const createFlow = useCreateFlow();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspace) {
      toast({
        title: "Error",
        description: "No workspace found",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const flow = await createFlow.mutateAsync({
        name,
        description,
        workspaceId: workspace.$id,
      });

      toast({
        title: "Flow created!",
        description: "Your new flow is ready to configure.",
      });

      router.push(`/dashboard/flows/${flow.$id}`);
    } catch (error: any) {
      toast({
        title: "Failed to create flow",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/dashboard/flows">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Flows
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Flow</CardTitle>
          <CardDescription>
            Set up a new event routing flow with webhook triggers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Flow Name *</Label>
              <Input
                id="name"
                placeholder="e.g., GitHub to Slack"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this flow do?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isCreating || !name}>
                {isCreating ? "Creating..." : "Create Flow"}
              </Button>
              <Link href="/dashboard/flows">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
