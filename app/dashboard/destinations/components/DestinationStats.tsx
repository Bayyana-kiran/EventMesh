import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DestinationStatsProps {
  totalDestinations: number;
  activeDestinations: number;
  totalEventsToday: number;
}

export function DestinationStats({
  totalDestinations,
  activeDestinations,
  totalEventsToday,
}: DestinationStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Total Destinations</CardDescription>
          <CardTitle className="text-3xl">{totalDestinations}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Active</CardDescription>
          <CardTitle className="text-3xl text-primary">
            {activeDestinations}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Events Delivered Today</CardDescription>
          <CardTitle className="text-3xl">{totalEventsToday}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
