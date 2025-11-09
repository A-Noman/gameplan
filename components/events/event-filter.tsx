"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EventFilterProps {
  eventTypes: string[];
  label: string;
}

export function EventFilter({ eventTypes, label }: EventFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("eventType");

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("eventType");
    } else {
      params.set("eventType", value);
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="event-filter">{label}</Label>
      <Select value={currentFilter || "all"} onValueChange={handleFilterChange}>
        <SelectTrigger id="event-filter" className="w-[180px]">
          <SelectValue placeholder="Filter by event type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {eventTypes.map((eventType) => (
            <SelectItem key={eventType} value={eventType}>
              {eventType}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
