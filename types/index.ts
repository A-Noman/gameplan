/**
 * Shared TypeScript types for the GamePlan application
 * Add your types here as you build out the application
 */

// Example types - replace with your actual types
export type Event = {
  id: string;
  title: string;
  description: string;
  date: Date;
  created_at: Date;
  updated_at: Date;
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

