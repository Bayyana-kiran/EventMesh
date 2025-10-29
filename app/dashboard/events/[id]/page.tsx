import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Zap } from "lucide-react";
import Link from "next/link";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const EVENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EVENTS!;
const FLOWS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FLOWS!;

export default async function EventDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  // `params` can be a Promise in some Next runtimes — await to ensure we have the value
  const { id } = await params;

  try {
    const event = await databases.getDocument(
      DATABASE_ID,
      EVENTS_COLLECTION_ID,
      id
    );

    let flowName = "-";
    let flowWebhook: string | null = event.webhook_url || null;
    if (event.flow_id) {
      try {
        const flow = await databases.getDocument(
          DATABASE_ID,
          FLOWS_COLLECTION_ID,
          event.flow_id
        );
        flowName = flow.name || flowName;
        // prefer webhook_url from the flow if available
        flowWebhook = flow.webhook_url || flowWebhook;
      } catch {
        // ignore missing flow
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Event Details</h1>
            <p className="text-muted-foreground mt-2">
              Inspect the selected event and execution info.
            </p>
          </div>
          <Link href="/dashboard/events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <CardTitle className="text-lg">
                    {event.event_type || "webhook.received"}
                  </CardTitle>
                  <CardDescription>
                    Flow: {flowName} • ID: {String(event.$id).slice(0, 8)}
                  </CardDescription>
                </div>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-3">
                <Calendar className="h-4 w-4" />
                <div>{new Date(event.$createdAt).toLocaleString()}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h3 className="font-medium">Payload</h3>
                <pre className="mt-2 p-3 bg-muted/10 rounded text-sm overflow-auto max-h-60">
                  {event.payload
                    ? JSON.stringify(JSON.parse(event.payload), null, 2)
                    : "(no payload)"}
                </pre>
              </div>

              <div>
                <h3 className="font-medium">Headers</h3>
                <pre className="mt-2 p-3 bg-muted/10 rounded text-sm overflow-auto max-h-40">
                  {event.headers || "(no headers)"}
                </pre>
              </div>

              <div>
                <h3 className="font-medium">Webhook URL</h3>
                <div className="mt-2 text-sm text-muted-foreground">
                  {flowWebhook || event.webhook_url || "-"}
                </div>
              </div>

              {event.error_message && (
                <div>
                  <h3 className="font-medium text-destructive">Error</h3>
                  <div className="mt-2 text-sm text-destructive">
                    {event.error_message}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch {
    // If not found or any other error, show a 404-like message
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <p className="text-muted-foreground mt-2">
          We could not find an event with id{" "}
          <code className="font-mono">{id}</code>.
        </p>
        <div className="mt-6">
          <Link href="/dashboard/events">
            <Button variant="ghost">Back to events</Button>
          </Link>
        </div>
      </div>
    );
  }
}
