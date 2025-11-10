import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { ProfileForm } from "@/components/auth/profile-form";
import { getProfile } from "@/app/actions/profile";
import { getEvents, getUniqueEventTypes } from "@/app/actions/events";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EventFilter } from "@/components/events/event-filter";
import { Suspense } from "react";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { DEFAULT_EVENT_TYPES } from "@/lib/constants/events";
import { MyEventsToggle } from "@/components/events/my-events-toggle";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    eventType?: string;
    search?: string;
    myEvents?: string;
  }>;
}) {
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

  // Get search params
  const params = await searchParams;
  const eventTypeFilter = params.eventType;
  const searchQuery = params.search;
  const showOnlyMine = params.myEvents === "true";

  // Fetch unique event types and events if user has a name
  const [eventTypesResult, eventsResult] = hasName
    ? await Promise.all([
        getUniqueEventTypes(),
        getEvents(eventTypeFilter, searchQuery, showOnlyMine),
      ])
    : [
        { eventTypes: null, error: null },
        { events: null, error: null },
      ];

  const dbEventTypes = eventTypesResult.eventTypes || [];
  const eventsError = eventsResult.error;
  const events = eventsResult.events;
  const availableEventTypes = Array.from(
    new Set([...dbEventTypes, ...DEFAULT_EVENT_TYPES])
  ).sort((a, b) => a.localeCompare(b));

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="max-w-7xl w-full mx-auto">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-4xl font-bold">GamePlan</h1>
          <div className="flex items-center gap-3">
            {hasName && (
              <>
                <MyEventsToggle />
                <EventFormDialog
                  mode="create"
                  eventTypes={availableEventTypes}
                  trigger={
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                  }
                />
              </>
            )}
            <LogoutButton />
          </div>
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

            {/* Event Filter */}
            {dbEventTypes.length > 0 && (
              <div className="mb-6">
                <Suspense
                  fallback={
                    <div className="h-10 w-[180px] bg-muted animate-pulse rounded-md" />
                  }
                >
                  <EventFilter
                    eventTypes={dbEventTypes}
                    label="Filter by Sport"
                  />
                </Suspense>
              </div>
            )}

            {/* Error State */}
            {eventsError && (
              <Card className="mb-6 border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Error</CardTitle>
                  <CardDescription>{eventsError}</CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Empty State */}
            {!eventsError && events && events.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No Events Found</CardTitle>
                  <CardDescription>
                    {eventTypeFilter || searchQuery
                      ? "Try adjusting your filters or search terms."
                      : "There are no events in the database yet."}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Events Grid */}
            {!eventsError && events && events.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    eventTypes={availableEventTypes}
                    currentUserId={user.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
