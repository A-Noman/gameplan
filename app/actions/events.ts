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

export async function getEvents() {
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

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

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

export async function getEventsByType(eventType: string) {
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

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("event_type", eventType)
    .order("event_date", { ascending: true });

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

