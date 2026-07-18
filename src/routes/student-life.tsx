import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/PageHero";
import { BookOpen, Bus, Cpu, Music, Trophy, Users } from "lucide-react";
import sports from "@/assets/sports.jpg";
import culture from "@/assets/culture.jpg";
import scienceLab from "@/assets/science-lab.jpg";
import classroom from "@/assets/classroom.jpg";

export const Route = createFileRoute("/student-life")({
  head: () => ({
    meta: [
      { title: "Student Life — Talents College Mukono" },
      {
        name: "description",
        content:
          "Clubs, sports, music dance & drama, ICT, library, trips and student leadership at Talents College, Mukono.",
      },
      { property: "og:title", content: "Student Life — Talents College Mukono" },
      {
        property: "og:description",
        content: "Explore clubs, sports, arts, ICT and leadership at Talents College Mukono.",
      },
    ],
  }),
  component: StudentLife,
});

const facilities = [
  {
    icon: Trophy,
    title: "Sports",
    body: "Football, netball, volleyball, basketball, athletics and swimming — competitive and recreational.",
    img: sports,
  },
  {
    icon: Music,
    title: "Music, Dance & Drama",
    body: "Choir, traditional dance troupes, drama club and an annual MDD festival that draws the whole community.",
    img: culture,
  },
  {
    icon: Cpu,
    title: "ICT Lab",
    body: "Modern computer lab with high-speed internet supporting the ICT curriculum and coding club.",
    img: scienceLab,
  },
  {
    icon: BookOpen,
    title: "Library",
    body: "A well-stocked library with study zones, reference materials and digital learning resources.",
    img: classroom,
  },
];

const clubs = [
  "Debate & Public Speaking",
  "Wildlife & Environment",
  "Journalism & Media",
  "Chess",
  "Robotics & Coding",
  "Entrepreneurship",
  "Red Cross",
  "Scripture Union",
  "Interact / Rotary",
  "Peer Counsellors",
  "Photography",
  "Culinary Arts",
];

const leadership = [
  "Head Prefect & Deputy",
  "Academic Prefects",
  "Games & Sports Prefects",
  "Dining Hall & Hospitality",
  "Chapel & Welfare",
  "Time Keepers & Health",
];

function StudentLife() {
  return (
    <>
      <PageHero
        eyebrow="Student life"
        title="Beyond the classroom, the whole student grows."
        description="At Talents College Mukono we take pride in the range of things our students do outside the timetable — because character, confidence and community are shaped there."
        image={sports}
        imageAlt="Student athletes competing on the Talents College sports field"
        crumbs={[{ label: "Student Life" }]}
        layout="feature"
      />

      <Section id="clubs">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
              Clubs & societies
            </div>
            <h2 className="mt-2 font-display font-black text-3xl">A club for every passion.</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Every student joins at least one club. It's where friendships form and talents are
              discovered — often the memory a graduate carries longest.
            </p>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {clubs.map((c) => (
                <div
                  key={c}
                  className="p-4 rounded-xl border border-border bg-card text-sm font-medium hover:bg-flag-yellow hover:text-flag-black hover:border-flag-yellow transition-colors"
                >
                  {c}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl p-8 bg-flag-black text-white h-fit">
            <div className="text-xs uppercase tracking-widest text-flag-yellow font-semibold">
              Student leadership
            </div>
            <h3 className="mt-2 font-display font-bold text-2xl">Led by students, for students.</h3>
            <p className="mt-3 text-white/80 text-sm">
              Our prefect body is elected each year and represents the student voice in school
              governance.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {leadership.map((r) => (
                <li key={r} className="flex items-center gap-2">
                  <Users className="size-4 text-flag-yellow" />
                  {r}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>

      <Section id="sports" className="!pt-0">
        <div className="grid gap-6 md:grid-cols-2">
          {facilities.map((f) => (
            <div key={f.title} className="group relative rounded-3xl overflow-hidden aspect-[4/3]">
              <img
                src={f.img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-flag-black/95 via-flag-black/40 to-transparent" />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
                <f.icon className="size-6 text-flag-yellow" />
                <h3 className="mt-3 font-display font-black text-2xl">{f.title}</h3>
                <p className="mt-2 text-sm text-white/85 max-w-md">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="trips" className="!pt-0">
        <div className="rounded-3xl bg-flag-yellow text-flag-black p-8 md:p-12 grid md:grid-cols-[auto_1fr_auto] gap-6 items-center">
          <div className="size-16 grid place-items-center rounded-2xl bg-flag-black text-flag-yellow">
            <Bus className="size-7" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold">School trips</div>
            <h3 className="mt-1 font-display font-black text-2xl md:text-3xl">
              Learning that travels.
            </h3>
            <p className="mt-2 max-w-2xl opacity-85">
              Each year students take educational tours to Kampala industries, national parks,
              research institutions and heritage sites — bringing classroom subjects to life.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
