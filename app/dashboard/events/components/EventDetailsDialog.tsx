"use client";

// no local state needed yet
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle } from "lucide-react";

interface EventDetailsDialogProps {
  eventId: string | null;
  open: boolean;
  onClose: () => void;
}

interface Event {
  $id: string;
  name: string;
  source: string;
  $createdAt: string;
  status: string;
  flow_id: string;
  execution_time?: number;
  payload: string;
  headers?: string;
  flow_name?: string;
  error_message?: string;
}

export function EventDetailsDialog({
  eventId,
  open,
  onClose,
}: EventDetailsDialogProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (eventId && open) {
      // use an inner async function to avoid calling setState synchronously in the effect body
      const fetchData = async () => {
        if (!mounted) return;
        setLoading(true);
        try {
          const res = await fetch(`/api/events/${eventId}`);
          const data = await res.json();
          if (!mounted) return;
          setEvent(data);
        } catch (error) {
          console.error("Failed to fetch event details:", error);
        } finally {
          if (mounted) setLoading(false);
        }
      };

      fetchData();
    } else {
      setEvent(null);
    }

    return () => {
      mounted = false;
    };
  }, [eventId, open]);

  if (!event && !loading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {event?.status === "completed" ? (
              <CheckCircle className="h-5 w-5 text-primary" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            {event?.name || "Loading..."}
          </DialogTitle>
          <DialogDescription>Event details and execution log</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : event ? (
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
                  <div className="font-mono text-sm">{event.$id}</div>
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
                  <div>{event.flow_name || event.flow_id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Received At
                  </div>
                  <div>{new Date(event.$createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Execution Time
                  </div>
                  <div>
                    {event.execution_time ? `${event.execution_time}ms` : "N/A"}
                  </div>
                </div>
              </div>
              {event.error_message && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="text-sm text-destructive font-medium">
                    Error
                  </div>
                  <div className="text-sm text-destructive/80 mt-1">
                    {event.error_message}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="payload">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                {(() => {
                  try {
                    const parsed = JSON.parse(event.payload);
                    return JSON.stringify(parsed, null, 2);
                  } catch {
                    return event.payload;
                  }
                })()}
              </pre>
            </TabsContent>

            <TabsContent value="headers">
              {event.headers ? (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  {(() => {
                    try {
                      const parsed = JSON.parse(event.headers);
                      return JSON.stringify(parsed, null, 2);
                    } catch {
                      return event.headers;
                    }
                  })()}
                </pre>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No headers available
                </div>
              )}
            </TabsContent>

            <TabsContent value="execution" className="space-y-3">
              <div className="text-center py-8 text-muted-foreground">
                Execution steps not available in current implementation
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Failed to load event details
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
