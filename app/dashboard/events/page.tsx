import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";

export default function EventsPage() {
  const events = [
    {
      id: "evt_1",
      name: "github.push",
      source: "GitHub Webhook",
      timestamp: "2 min ago",
      status: "success",
      flow: "GitHub to Slack",
      executionTime: "234ms",
    },
    {
      id: "evt_2",
      name: "stripe.payment_intent.succeeded",
      source: "Stripe Webhook",
      timestamp: "5 min ago",
      status: "success",
      flow: "Stripe to CRM",
      executionTime: "189ms",
    },
    {
      id: "evt_3",
      name: "form.submission",
      source: "Contact Form",
      timestamp: "8 min ago",
      status: "failed",
      flow: "Form to Email",
      executionTime: "456ms",
      error: "SMTP connection timeout",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground mt-2">
          Real-time event stream and history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Events Today</CardDescription>
            <CardTitle className="text-3xl">1,234</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl text-primary">98.5%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Response Time</CardDescription>
            <CardTitle className="text-3xl">245ms</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Flows</CardDescription>
            <CardTitle className="text-3xl">12</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest webhook events processed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      event.status === "success"
                        ? "bg-primary/10"
                        : "bg-destructive/10"
                    }`}
                  >
                    {event.status === "success" ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>

                  <div>
                    <div className="font-medium">{event.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{event.source}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>{event.flow}</span>
                    </div>
                    {event.error && (
                      <div className="text-xs text-destructive mt-1">
                        {event.error}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {event.executionTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {event.timestamp}
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
