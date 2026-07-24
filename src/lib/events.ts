import { supabase } from "@/integrations/supabase/client";

export type UpcomingEvent = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setHours(d.getHours() + days * 24);
  return d.toISOString();
};

const seedEvents: UpcomingEvent[] = [
  {
    id: "seed-1",
    title: "Parents' consultation day",
    description:
      "Term 2 parents' meeting. Meet teachers, review progress and collect report cards.",
    location: "Main Hall",
    starts_at: addDays(new Date(), 4),
    ends_at: null,
  },
  {
    id: "seed-2",
    title: "Inter-house athletics",
    description: "Annual inter-house sports gala — track, field and team events.",
    location: "School field",
    starts_at: addDays(new Date(), 11),
    ends_at: null,
  },
  {
    id: "seed-3",
    title: "S.6 mock examinations begin",
    description: "Final mock exams for Senior 6 in preparation for UACE.",
    location: "Exam halls",
    starts_at: addDays(new Date(), 18),
    ends_at: null,
  },
  {
    id: "seed-4",
    title: "Career & talent expo",
    description: "Explore career paths and showcase student talent projects.",
    location: "ICT Lab & Hall",
    starts_at: addDays(new Date(), 25),
    ends_at: null,
  },
];

export async function fetchUpcomingEvents(limit = 10): Promise<UpcomingEvent[]> {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("events")
      .select("id,title,description,location,starts_at,ends_at")
      .eq("published", true)
      .gte("starts_at", now)
      .order("starts_at", { ascending: true })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return seedEvents;
    }
    return data as UpcomingEvent[];
  } catch {
    return seedEvents;
  }
}

export async function fetchNextEvent(): Promise<UpcomingEvent | null> {
  const events = await fetchUpcomingEvents(1);
  return events[0] ?? null;
}
