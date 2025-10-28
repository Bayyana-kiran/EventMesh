"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface NewDestination {
  name: string;
  type: string;
  webhookUrl?: string;
  channel?: string;
}

interface AddDestinationDialogProps {
  onAdd?: (destination: NewDestination) => void;
}

export function AddDestinationDialog({ onAdd }: AddDestinationDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<NewDestination>({
    name: "",
    type: "",
    webhookUrl: "",
    channel: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd?.(formData);
    setOpen(false);
    setFormData({ name: "", type: "", webhookUrl: "", channel: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Destination
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Destination</DialogTitle>
          <DialogDescription>
            Configure a new destination to route your events to.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Slack Engineering"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: string) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select destination type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="webhook">Custom Webhook</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.type === "webhook" ||
            formData.type === "slack" ||
            formData.type === "discord") && (
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={formData.webhookUrl}
                onChange={(e) =>
                  setFormData({ ...formData, webhookUrl: e.target.value })
                }
                required
              />
            </div>
          )}

          {(formData.type === "slack" || formData.type === "discord") && (
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Input
                id="channel"
                placeholder="#engineering"
                value={formData.channel}
                onChange={(e) =>
                  setFormData({ ...formData, channel: e.target.value })
                }
              />
            </div>
          )}

          {formData.type === "email" && (
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="team@example.com"
                value={formData.channel}
                onChange={(e) =>
                  setFormData({ ...formData, channel: e.target.value })
                }
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Destination</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
