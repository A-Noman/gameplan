"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Profile = {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
};

export async function getProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Not authenticated",
      profile: null,
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    // If profile doesn't exist, return null (not an error)
    if (error.code === "PGRST116") {
      return {
        error: null,
        profile: null,
      };
    }
    return {
      error: error.message,
      profile: null,
    };
  }

  return {
    error: null,
    profile: profile as Profile,
  };
}

export async function updateProfile(firstName: string, lastName: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Not authenticated",
      success: false,
    };
  }

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existingProfile) {
    // Update existing profile
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      return {
        error: error.message,
        success: false,
      };
    }
  } else {
    // Create new profile
    const { error } = await supabase.from("profiles").insert({
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
    });

    if (error) {
      return {
        error: error.message,
        success: false,
      };
    }
  }

  revalidatePath("/", "layout");
  return {
    error: null,
    success: true,
  };
}

