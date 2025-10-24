"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface EventDetailsDialogProps {
  eventId: string | null;
  open: boolean;
  onClose: () => void;
}

export function EventDetailsDialog({
  eventId,
  open,
  onClose,
}: EventDetailsDialogProps) {
  // Mock data - replace with actual API call
  const event = {
    id: eventId || "evt_1",
    name: "github.push",
    source: "GitHub Webhook",
    timestamp: "2024-01-15T14:30:00Z",
    status: "success",
    flow: "GitHub to Slack",
    executionTime: "234ms",
    payload: {
      repository: "eventmesh/app",
      ref: "refs/heads/main",
      commits: [
        {
          id: "abc123",
          message: "Add new feature",
          author: "John Doe",
        },
      ],
    },
    headers: {
      "content-type": "application/json",
      "x-github-event": "push",
      "user-agent": "GitHub-Hookshot/abc123",
    },
    steps: [
      { name: "Receive Webhook", status: "success", duration: "12ms" },
      { name: "Transform Payload", status: "success", duration: "45ms" },
      { name: "Send to Slack", status: "success", duration: "177ms" },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {event.status === "success" ? (
              <CheckCircle className="h-5 w-5 text-primary" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            {event.name}
          </DialogTitle>
          <DialogDescription>Event details and execution log</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payload">Payload</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Event ID</div>
                <div className="font-mono text-sm">{event.id}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="capitalize">{event.status}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Source</div>
                <div>{event.source}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Flow</div>
                <div>{event.flow}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Received At</div>
                <div>{new Date(event.timestamp).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Execution Time
                </div>
                <div>{event.executionTime}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payload">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </TabsContent>

          <TabsContent value="headers">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(event.headers, null, 2)}
            </pre>
          </TabsContent>

          <TabsContent value="execution" className="space-y-3">
            {event.steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {step.status === "success" ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className="font-medium">{step.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {step.duration}
                </span>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
