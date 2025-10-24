"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Webhook, MessageSquare, Mail, Database } from "lucide-react";

interface Destination {
  id: string;
  name: string;
  type: string;
  channel: string;
  status: string;
  eventsToday: number;
}

interface DestinationCardProps {
  destination: Destination;
  onConfigure?: (id: string) => void;
  onTest?: (id: string) => void;
}

export function DestinationCard({
  destination,
  onConfigure,
  onTest,
}: DestinationCardProps) {
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
    <Card className="hover:border-primary/50 transition-colors">
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
            <div className="text-2xl font-bold">{destination.eventsToday}</div>
            <div className="text-xs text-muted-foreground">Events Today</div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConfigure?.(destination.id)}
            >
              Configure
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTest?.(destination.id)}
            >
              Test
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
