"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import {
  eventFormSchema,
  type EventFormValues,
} from "@/lib/validations/events";
import type { Event } from "@/types";

const eventActionsPromise = import("@/app/actions/events");

type EventFormDialogMode = "create" | "edit";

interface EventFormDialogProps {
  mode: EventFormDialogMode;
  eventTypes: string[];
  trigger?: React.ReactNode;
  event?: Event;
}

export function EventFormDialog({
  mode,
  eventTypes,
  trigger,
  event,
}: EventFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (mode === "edit" && !event) {
    throw new Error("EventFormDialog: event is required when mode is 'edit'.");
  }

  const initialValues = useMemo<EventFormValues>(() => {
    return {
      name: event?.name ?? "",
      eventType: event?.event_type ?? "",
      eventDate: event ? toLocalDateTimeInput(event.event_date) : "",
      venue: event?.venue ?? "",
      description: event?.description ?? null,
    };
  }, [event]);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(initialValues);
      form.clearErrors();
      setFormError(null);
    }
  }, [open, form, initialValues]);

  const title = mode === "create" ? "Create Event" : "Edit Event";
  const description =
    mode === "create"
      ? "Fill out the details below to create a new event."
      : "Update the event information and save your changes.";

  const submitLabel = mode === "create" ? "Create Event" : "Save Changes";

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);

    startTransition(async () => {
      const payload = {
        ...values,
        description:
          typeof values.description === "string" &&
          values.description.length > 0
            ? values.description
            : null,
      };

      const { createEvent, updateEvent } = await eventActionsPromise;

      const result =
        mode === "create"
          ? await createEvent(payload)
          : await updateEvent(event!.id, payload);

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (!messages || messages.length === 0) continue;
          form.setError(field as keyof EventFormValues, {
            type: "server",
            message: messages[0],
          });
        }
      }

      if (result.error) {
        console.log(result.error);
        setFormError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success(result.success ?? "Event saved.");

      if (mode === "create") {
        form.reset({
          name: "",
          eventType: "",
          eventDate: "",
          venue: "",
          description: null,
        });
      }

      setOpen(false);
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Summer League Kickoff"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger disabled={isPending}>
                        <SelectValue placeholder="Select a sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date &amp; Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      disabled={isPending}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Community Sports Complex"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share any details about the event that people should know..."
                      value={field.value ?? ""}
                      disabled={isPending}
                      onChange={field.onChange}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formError && (
              <p className="text-sm font-medium text-destructive">
                {formError}
              </p>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function toLocalDateTimeInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}
