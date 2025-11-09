import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { ProfileForm } from "@/components/auth/profile-form";
import { getProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // This shouldn't happen due to middleware, but just in case
  if (!user) {
    redirect("/login");
  }

  // Check if user has a profile with name
  const { profile } = await getProfile();
  const hasName = profile?.first_name;
  const displayName = hasName ? `${profile.first_name}` : user.email;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">GamePlan</h1>
        <p className="text-center text-muted-foreground mb-8">
          Event Management Application
        </p>
        <div className="flex flex-col items-center gap-4">
          {!hasName ? (
            <div className="w-full max-w-md">
              <ProfileForm />
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-lg font-semibold">Welcome, {displayName}!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  You are successfully authenticated.
                </p>
              </div>
              <LogoutButton />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
