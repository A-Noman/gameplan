"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EventFilterProps {
  eventTypes: string[];
  label: string;
}

export function EventFilter({ eventTypes, label }: EventFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("eventType");
  const currentSearch = searchParams.get("search") ?? "";
  const [searchValue, setSearchValue] = useState(currentSearch);
  const [filterValue, setFilterValue] = useState(currentFilter);
  const [isPending, startTransition] = useTransition();
  const hasActiveFilter = Boolean(currentFilter);
  const hasActiveSearch = Boolean(currentSearch);
  const showReset = hasActiveFilter || hasActiveSearch;

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("eventType");
    } else {
      params.set("eventType", value);
    }

    setFilterValue(value);

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    event.preventDefault();
    const trimmedValue = searchValue.trim();

    startTransition(() => {
      if (trimmedValue.length === 0) {
        params.delete("search");
      } else {
        params.set("search", trimmedValue);
      }

      router.push(`?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setSearchValue("");
    setFilterValue("all");

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("eventType");
      params.delete("search");
      const queryString = params.toString();

      router.replace(queryString ? `?${queryString}` : "?");
    });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="flex flex-col gap-2">
        <Label htmlFor="event-filter">{label}</Label>
        <Select value={filterValue || "all"} onValueChange={handleFilterChange}>
          <SelectTrigger id="event-filter" className="w-[180px] md:w-[220px]">
            <SelectValue placeholder="Filter by event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {eventTypes.map((eventType) => (
              <SelectItem key={eventType} value={eventType}>
                {eventType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 md:flex-1">
        <Label htmlFor="event-search">Search Events</Label>
        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
          onSubmit={handleSearchSubmit}
        >
          <Input
            id="event-search"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search by event name"
            className="sm:flex-1"
          />
          <Button type="submit" className="sm:w-auto" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
          {showReset && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isPending}
            >
              Reset
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
