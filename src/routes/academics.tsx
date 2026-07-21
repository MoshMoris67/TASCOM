import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/PageHero";
import { CardGrid } from "@/components/motion";
import {
  Atom,
  BookMarked,
  Calculator,
  Globe2,
  Landmark,
  Languages,
  Palette,
  Trophy,
} from "lucide-react";
import classroom from "@/assets/classroom.jpg";

export const Route = createFileRoute("/academics")({
  head: () => ({
    meta: [
      { title: "Academics — Talents College Mukono" },
      {
        name: "description",
        content:
          "Subjects offered at O and A Level, curriculum, departments, academic calendar and examination results.",
      },
      { property: "og:title", content: "Academics — Talents College Mukono" },
      { property: "og:description", content: "O & A Level programs, departments and calendar." },
    ],
  }),
  component: Academics,
});

const departments = [
  { icon: Calculator, name: "Mathematics", head: "Head: Sciences Faculty" },
  { icon: Atom, name: "Sciences", head: "Physics · Chemistry · Biology" },
  { icon: Languages, name: "Languages", head: "English · Literature · Luganda" },
  { icon: Landmark, name: "Humanities", head: "History · Geography · CRE / IRE" },
  { icon: Globe2, name: "Vocational & Tech", head: "ICT · Entrepreneurship · Agriculture" },
  { icon: Palette, name: "Creative Arts", head: "Fine Art · Music · Dance · Drama" },
];

const oLevelCore = [
  "English Language",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "History & Political Education",
];

const oLevelElectives = [
  "CRE / IRE",
  "Literature in English",
  "Luganda",
  "Kiswahili",
  "ICT",
  "Entrepreneurship",
  "Agriculture",
  "Fine Art",
  "Physical Education",
  "Art & Design",
];
const aLevelSciences = [
  "PCM/ICT — Physics · Chemistry · Mathematics",
  "PEM/SM — Physics · Economics · Mathematics",
  "PCB/SM — Physics · Chemistry · Biology",
  "PEntM/ICT — Biology · Entrepreneurship · Mathematics",
  "PAM/ICT — Physics · Agriculture · Mathematics",
  "BCF/SM — Biology · Chemistry · Food & Nutrition",
  "MEG/SM — Mathematics · Economics · Geography",
  "BCG/SM — Biology · Chemistry · Geography",
  "BCA/SM — Biology · Chemistry · Agriculture",
  "BAG/SM — Biology · Agriculture · Geography",
];

const aLevelArts = [
  "MEntG/ICT — History · Entrepreneurship · Geography",
  "HED/SM — History · Economics · Divinity",
  "MEntG/ICT — Mathematics · Entrepreneurship · Geography",
  "HEG/SM — History · Economics · Geography",
  "HEL/ICT — History · Economics · Literature in English",
  "HLD/SM — History · Literature in English · Divinity",
  "HDG/SM — History · Divinity · Geography",
  "HLG/SM — History · Literature in English · Geography",
  "HEntG/ICT — History · Entrepreneurship · Geography",
  "HEntL/ICT — History · Entrepreneurship · Literature in English",
  "HEntD/ICT — History · Entrepreneurship · Divinity",
  "DEG/SM — Divinity · Economics · Geography",
  "DEA/SM — Divinity · Economics · Fine Art",
  "DEntG/SM — Divinity · Entrepreneurship · Geography",
  "LED/SM — Literature · Economics · Divinity",
  "LEG/SM — Literature · Economics · Geography",
  "LEA/SM — Literature · Economics · Fine Art",
  "GEA/SM — Geography · Economics · Fine Art",
  "GEntA/ICT — Geography · Economics · Fine Art",
  "HEA/SM — History · Economics · Fine Art",
  "HAG/SM — History, Fine Art, Geography",
];

const aLevelSubsidiaries = "Subsidiaries — Sub-ICT, Sub-Math and General Paper for all";

const calendar = [
  {
    term: "Term 1",
    dates: "Feb 03 – May 02, 2026",
    highlights: "Sports gala · MDD · Prefectorial Elections",
  },
  {
    term: "Term 2",
    dates: "May 26 – Aug 22, 2026",
    highlights: "Music, dance & drama · UCE mocks ·PROM  · Career expo",
  },
  {
    term: "Term 3",
    dates: "Sep 15 – Dec 05, 2026",
    highlights: "National examinations · Science & Innovation Exhibition",
  },
];

function Academics() {
  return (
    <>
      <PageHero
        eyebrow="Academics"
        title="A rigorous, well-rounded curriculum."
        description="Our O and A Level programs balance academic depth, practical skills and character formation — preparing students for national examinations and life beyond school."
        image={classroom}
        imageAlt="A lesson in progress at Talents College Mukono"
        crumbs={[{ label: "Academics" }]}
        tone="cream"
        layout="split"
      />

      <Section id="curriculum">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl p-8 bg-flag-yellow text-flag-black">
            <div className="flex items-center gap-3">
              <div className="size-11 grid place-items-center rounded-xl bg-flag-black text-flag-yellow">
                <BookMarked className="size-5" />
              </div>
              <div className="text-xs uppercase tracking-widest font-semibold">Ordinary Level</div>
            </div>
            <h2 className="mt-4 font-display font-black text-3xl">O Level (S.1 – S.4)</h2>
            <p className="mt-3 opacity-85">
              A broad foundation across sciences, humanities, languages and practical subjects —
              preparing students for the Uganda Certificate of Education (UCE).
            </p>

            <div className="mt-6 space-y-6">
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold">
                  Core / Compulsory Subjects
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {oLevelCore.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span>→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest font-semibold">
                  Electives / Optional Sujects
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {oLevelElectives.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span>→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-8 bg-flag-black text-white">
            <div className="flex items-center gap-3">
              <div className="size-11 grid place-items-center rounded-xl bg-flag-yellow text-flag-black">
                <Trophy className="size-5" />
              </div>
              <div className="text-xs uppercase tracking-widest text-flag-yellow font-semibold">
                Advanced Level
              </div>
            </div>
            <h2 className="mt-4 font-display font-black text-3xl">A Level (S.5 – S.6)</h2>
            <p className="mt-3 text-white/80">
              Focused subject combinations preparing students for the Uganda Advanced Certificate of Education (UACE) and university entry.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 p-5">
                <div className="text-xs uppercase tracking-widest text-flag-yellow font-semibold">
                  Sciences
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {aLevelSciences.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span className="text-flag-yellow">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/15 p-5">
                <div className="text-xs uppercase tracking-widest text-flag-yellow font-semibold">
                  Arts
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {aLevelArts.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span className="text-flag-yellow">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/15 p-5">
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-flag-yellow">→</span>
                  <span>{aLevelSubsidiaries}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section id="departments" className="!pt-0">
        <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
          Departments
        </div>
        <h2 className="mt-2 font-display font-black text-3xl md:text-4xl">
          Where subjects come alive.
        </h2>
        <CardGrid className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" tilt tiltMax={7}>
          {departments.map((d) => (
            <div
              key={d.name}
              className="p-6 rounded-2xl border border-border bg-card hover:shadow-elegant transition-shadow"
            >
              <div className="size-12 grid place-items-center rounded-xl bg-flag-red/10 text-flag-red">
                <d.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-display font-bold text-lg">{d.name}</h3>
              <p className="text-sm text-muted-foreground">{d.head}</p>
            </div>
          ))}
        </CardGrid>
      </Section>

      <Section className="!pt-0">
        <div className="grid gap-8 lg:grid-cols-3">
          <div id="calendar" className="lg:col-span-2 scroll-mt-24 md:scroll-mt-28">
            <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
              Academic calendar & timetable
            </div>
            <h2 className="mt-2 font-display font-black text-3xl">Terms & key dates.</h2>
            <CardGrid className="mt-6 space-y-4">
              {calendar.map((t) => (
                <div
                  key={t.term}
                  className="p-5 rounded-2xl border border-border bg-card grid md:grid-cols-[auto_1fr] gap-5"
                >
                  <div className="md:w-40">
                    <div className="font-display font-bold text-2xl text-flag-red">{t.term}</div>
                    <div className="text-sm text-muted-foreground">{t.dates}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{t.highlights}</div>
                </div>
              ))}
            </CardGrid>
          </div>
          <div id="exam-results" className="rounded-3xl p-8 bg-muted h-fit scroll-mt-24 md:scroll-mt-28">
            <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">Examinations</div>
            <h3 className="mt-2 font-display font-bold text-2xl">Results & pass rates</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Our students consistently record strong performance in UCE and UACE, with First
              Grade rates trending above 60% year on year and A-Level Division-One entries in
              science and humanities combinations.
            </p>
            <div className="mt-6 space-y-3">
              {[
                { l: "UCE First Grade rate", v: "62%" },
                { l: "UACE Principal Pass rate", v: "88%" },
                { l: "University placement", v: "74%" },
              ].map((s) => (
                <div key={s.l} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <span className="text-sm">{s.l}</span>
                  <span className="font-display font-bold text-xl text-flag-red">{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
