"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  eventFormSchema,
  type EventFormValues,
} from "@/lib/validations/events";
import type { Event } from "@/types";

export type EventActionResult = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<keyof EventFormValues, string[]>>;
};

type NormalizedEventPayload = Omit<EventFormValues, "description"> & {
  description: string | null;
};

export async function getEvents(
  eventType?: string,
  searchTerm?: string,
  onlyMine?: boolean
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Not authenticated",
      events: null,
    };
  }

  let query = supabase
    .from("events")
    .select(
      "id, name, event_type, event_date, description, venue, created_by, created_at, updated_at"
    );

  if (eventType) {
    query = query.eq("event_type", eventType);
  }

  const trimmedSearch = searchTerm?.trim();

  if (trimmedSearch) {
    query = query.ilike("name", `%${trimmedSearch}%`);
  }

  if (onlyMine) {
    query = query.eq("created_by", user.id);
  }

  const { data: events, error } = await query.order("event_date", {
    ascending: true,
  });

  if (error) {
    return {
      error: error.message,
      events: null,
    };
  }

  return {
    error: null,
    events: events as Event[],
  };
}

export async function getEventById(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Not authenticated",
      event: null,
    };
  }

  const { data: event, error } = await supabase
    .from("events")
    .select(
      "id, name, event_type, event_date, description, venue, created_by, created_at, updated_at"
    )
    .eq("id", id)
    .single();

  if (error) {
    return {
      error: error.message,
      event: null,
    };
  }

  return {
    error: null,
    event: event as Event,
  };
}

export async function getUniqueEventTypes() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Not authenticated",
      eventTypes: null,
    };
  }

  const { data: events, error } = await supabase
    .from("events")
    .select("event_type");

  if (error) {
    return {
      error: error.message,
      eventTypes: null,
    };
  }

  // Get unique event types and sort them
  const uniqueEventTypes = Array.from(
    new Set(events.map((event) => event.event_type))
  ).sort();

  return {
    error: null,
    eventTypes: uniqueEventTypes,
  };
}

export async function createEvent(
  input: EventFormValues
): Promise<EventActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be signed in to create an event.",
    };
  }

  const validation = eventFormSchema.safeParse(input);

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return {
      error: "Please fix the highlighted errors.",
      fieldErrors: fieldErrors as EventActionResult["fieldErrors"],
    };
  }

  const payload = normalizeEventPayload(validation.data);

  const { error } = await supabase
    .from("events")
    .insert({
      name: payload.name,
      event_type: payload.eventType,
      event_date: payload.eventDate,
      description: payload.description,
      venue: payload.venue,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    console.log(error);
    return {
      error: "We couldn't create the event. Please try again.",
    };
  }

  revalidatePath("/");

  return {
    success: "Event created successfully.",
  };
}

export async function updateEvent(
  eventId: string,
  input: EventFormValues
): Promise<EventActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be signed in to update an event.",
    };
  }

  const validation = eventFormSchema.safeParse(input);

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return {
      error: "Please fix the highlighted errors.",
      fieldErrors: fieldErrors as EventActionResult["fieldErrors"],
    };
  }

  const { data: existingEvent, error: fetchError } = await supabase
    .from("events")
    .select("id, created_by")
    .eq("id", eventId)
    .single();

  if (fetchError || !existingEvent) {
    return {
      error: "Event not found.",
    };
  }

  if (existingEvent.created_by !== user.id) {
    return {
      error: "You can only edit events that you created.",
    };
  }

  const payload = normalizeEventPayload(validation.data);

  const { error } = await supabase
    .from("events")
    .update({
      name: payload.name,
      event_type: payload.eventType,
      event_date: payload.eventDate,
      description: payload.description,
      venue: payload.venue,
    })
    .eq("id", eventId);

  if (error) {
    return {
      error: "We couldn't update the event. Please try again.",
    };
  }

  revalidatePath("/");

  return {
    success: "Event updated successfully.",
  };
}

export async function deleteEvent(eventId: string): Promise<EventActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be signed in to delete an event.",
    };
  }

  const { data: existingEvent, error: fetchError } = await supabase
    .from("events")
    .select("id, created_by")
    .eq("id", eventId)
    .single();

  if (fetchError || !existingEvent) {
    return {
      error: "Event not found.",
    };
  }

  if (existingEvent.created_by !== user.id) {
    return {
      error: "You can only delete events that you created.",
    };
  }

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    return {
      error: "We couldn't delete the event. Please try again.",
    };
  }

  revalidatePath("/");

  return {
    success: "Event deleted successfully.",
  };
}

function normalizeEventPayload(
  data: EventFormValues
): NormalizedEventPayload & { eventDate: string } {
  const trimmedDescription =
    typeof data.description === "string" && data.description.length > 0
      ? data.description
      : null;

  return {
    name: data.name.trim(),
    eventType: data.eventType.trim(),
    eventDate: new Date(data.eventDate).toISOString(),
    venue: data.venue.trim(),
    description: trimmedDescription,
  };
}
