/**
 * Shared TypeScript types for the GamePlan application
 * Add your types here as you build out the application
 */

export type Event = {
  id: string;
  name: string;
  event_type: string;
  event_date: string;
  description: string | null;
  venue: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  created_at: Date;
};

export type Profile = {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: Date;
  updated_at: Date;
};

