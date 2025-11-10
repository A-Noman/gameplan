import { z } from "zod";

export const eventFormSchema = z.object({
  name: z
    .string({ required_error: "Event name is required" })
    .trim()
    .min(3, { message: "Event name must be at least 3 characters" })
    .max(100, { message: "Event name must be 100 characters or fewer" }),
  eventType: z
    .string({ required_error: "Event type is required" })
    .trim()
    .min(1, { message: "Please select an event type" }),
  eventDate: z
    .string({ required_error: "Date and time is required" })
    .trim()
    .refine(
      (value) => {
        if (!value) return false;
        const timestamp = Date.parse(value);
        return Number.isFinite(timestamp);
      },
      { message: "Please select a valid date and time" }
    ),
  venue: z
    .string({ required_error: "Location is required" })
    .trim()
    .min(2, { message: "Location must be at least 2 characters" })
    .max(200, { message: "Location must be 200 characters or fewer" }),
  description: z
    .string()
    .trim()
    .max(500, { message: "Description must be 500 characters or fewer" })
    .optional()
    .or(z.literal(""))
    .transform((value) => (value && value.length > 0 ? value : null)),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

