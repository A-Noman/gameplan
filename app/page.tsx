import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { ProfileForm } from "@/components/auth/profile-form";
import { getProfile } from "@/app/actions/profile";
import { getEvents } from "@/app/actions/events";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  // Fetch events if user has a name
  const { events, error } = hasName
    ? await getEvents()
    : { events: null, error: null };

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="max-w-7xl w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">GamePlan</h1>
            <p className="text-muted-foreground mt-2">
              Event Management Application
            </p>
          </div>
          <LogoutButton />
        </div>

        {!hasName ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                  Please provide your name to continue.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm />
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Welcome Message */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold">
                Welcome, {displayName}!
              </h2>
              <p className="text-muted-foreground mt-1">
                We&apos;ll see you at the game
              </p>
            </div>

            {/* Error State */}
            {error && (
              <Card className="mb-6 border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Error</CardTitle>
                  <CardDescription>{error}</CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Empty State */}
            {!error && events && events.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No Events Found</CardTitle>
                  <CardDescription>
                    There are no events in the database yet.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Events Grid */}
            {!error && events && events.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <Card key={event.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">{event.name}</CardTitle>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                          {event.event_type}
                        </span>
                      </div>
                      <CardDescription>
                        {new Date(event.event_date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {event.description}
                        </p>
                      )}
                      <div className="mt-auto pt-4 border-t">
                        <p className="text-sm font-medium">📍 {event.venue}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
