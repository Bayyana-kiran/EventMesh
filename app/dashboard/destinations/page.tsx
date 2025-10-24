import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Webhook, MessageSquare, Mail, Database } from "lucide-react";

export default function DestinationsPage() {
  const destinations = [
    {
      id: "1",
      name: "Slack Engineering",
      type: "slack",
      channel: "#engineering",
      status: "active",
      eventsToday: 234,
    },
    {
      id: "2",
      name: "Discord Notifications",
      type: "discord",
      channel: "#webhooks",
      status: "active",
      eventsToday: 89,
    },
    {
      id: "3",
      name: "Email Alerts",
      type: "email",
      channel: "team@example.com",
      status: "active",
      eventsToday: 45,
    },
    {
      id: "4",
      name: "Custom API",
      type: "webhook",
      channel: "api.example.com",
      status: "inactive",
      eventsToday: 0,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "slack":
        return <MessageSquare className="h-5 w-5" />;
      case "discord":
        return <MessageSquare className="h-5 w-5" />;
      case "email":
        return <Mail className="h-5 w-5" />;
      case "webhook":
        return <Webhook className="h-5 w-5" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Destinations</h1>
          <p className="text-muted-foreground mt-2">
            Manage where your events are delivered
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Destination
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Destinations</CardDescription>
            <CardTitle className="text-3xl">{destinations.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {destinations.filter((d) => d.status === "active").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Events Delivered Today</CardDescription>
            <CardTitle className="text-3xl">
              {destinations.reduce((sum, d) => sum + d.eventsToday, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {destinations.map((destination) => (
          <Card
            key={destination.id}
            className="hover:border-primary/50 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {getIcon(destination.type)}
                  </div>
                  <div>
                    <CardTitle>{destination.name}</CardTitle>
                    <CardDescription>{destination.channel}</CardDescription>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    destination.status === "active"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {destination.status}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {destination.eventsToday}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Events Today
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                  <Button variant="ghost" size="sm">
                    Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
