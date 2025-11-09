"use server";

import { createClient } from "@/lib/supabase/server";

export type Event = {
  id: string;
  name: string;
  event_type: string;
  event_date: string;
  description: string | null;
  venue: string;
  created_at: string;
  updated_at: string;
};

export async function getEvents(eventType?: string) {
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

  let query = supabase.from("events").select("*");

  if (eventType) {
    query = query.eq("event_type", eventType);
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
    .select("*")
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

