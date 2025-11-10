"use client";

import { useMemo, useTransition } from "react";
import { CalendarPlus, Pencil, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import type { Event } from "@/types";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { buildICSFromEvent } from "@/lib/utils/ics";

const eventActionsPromise = import("@/app/actions/events");

interface EventCardProps {
  event: Event;
  eventTypes: string[];
  currentUserId: string;
}

export function EventCard({
  event,
  eventTypes,
  currentUserId,
}: EventCardProps) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const isOwner = event.created_by === currentUserId;
  const calendarFileName = useMemo(() => {
    const slug = event.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "");

    return `${slug.length > 0 ? slug : "event"}-${event.id}.ics`;
  }, [event.id, event.name]);

  const handleAddToCalendar = () => {
    try {
      const icsContent = buildICSFromEvent(event, {
        eventUrl: window.location.href,
      });

      const blob = new Blob([icsContent], {
        type: "text/calendar;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = calendarFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Calendar invite downloaded.");
    } catch (error) {
      console.error(error);
      toast.error(
        "We couldn't generate the calendar invite. Please try again."
      );
    }
  };

  const handleDelete = () => {
    if (!isOwner) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    startDeleteTransition(async () => {
      const { deleteEvent } = await eventActionsPromise;
      const result = await deleteEvent(event.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.success ?? "Event deleted.");
    });
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{event.name}</CardTitle>
            <CardDescription>{formatEventDate(event.event_date)}</CardDescription>
          </div>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
            {event.event_type}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}
        <div className="mt-auto flex flex-col gap-3 border-t pt-4">
          <p className="text-sm font-medium">📍 {event.venue}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddToCalendar}
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Add to my calendar
            </Button>
            {isOwner && (
              <>
                <EventFormDialog
                  mode="edit"
                  event={event}
                  eventTypes={eventTypes}
                  trigger={
                    <Button size="sm" variant="outline">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  }
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatEventDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

