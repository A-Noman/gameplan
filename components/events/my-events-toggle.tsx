"use client";

import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function MyEventsToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isActive = searchParams.get("myEvents") === "true";

  const handleToggle = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (isActive) {
      params.delete("myEvents");
    } else {
      params.set("myEvents", "true");
    }

    const queryString = params.toString();

    startTransition(() => {
      router.push(queryString ? `?${queryString}` : "?");
    });
  };

  return (
    <Button
      size="sm"
      variant={isActive ? "secondary" : "outline"}
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={isActive}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isActive ? (
        <Check className="mr-2 h-4 w-4" />
      ) : null}
      <span className="whitespace-nowrap">
        {isActive ? "My Events On" : "My Events"}
      </span>
    </Button>
  );
}

