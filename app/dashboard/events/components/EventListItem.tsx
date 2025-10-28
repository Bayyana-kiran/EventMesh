"use client";

// No card components used here; keep the component lightweight
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";

interface Event {
  id: string;
  name: string;
  source: string;
  timestamp: string;
  status: string;
  flow: string;
  executionTime: string;
  error?: string;
}

interface EventListItemProps {
  event: Event;
  onViewDetails?: (id: string) => void;
}

export function EventListItem({ event, onViewDetails }: EventListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            event.status === "success" ? "bg-primary/10" : "bg-destructive/10"
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
            <div className="text-xs text-destructive mt-1">{event.error}</div>
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails?.(event.id)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
