import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, Band } from "@/components/layout/PageHero";
import { CardGrid } from "@/components/motion";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Heart,
  HeartHandshake,
  Mail,
  Music,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { photos } from "@/lib/photos";
import { school } from "@/lib/school-info";

import staff01 from "@/assets/staff-placeholder-01.svg?inline";
import staff02 from "@/assets/staff-placeholder-02.svg?inline";
import staff03 from "@/assets/staff-placeholder-03.svg?inline";
import staff04 from "@/assets/staff-placeholder-04.svg?inline";
import staff05 from "@/assets/staff-placeholder-05.svg?inline";
import staff06 from "@/assets/staff-placeholder-06.svg?inline";
import staff07 from "@/assets/staff-placeholder-07.svg?inline";
import staff08 from "@/assets/staff-placeholder-08.svg?inline";
import staff09 from "@/assets/staff-placeholder-09.svg?inline";
import staff10 from "@/assets/staff-placeholder-10.svg?inline";
import staff11 from "@/assets/staff-placeholder-11.svg?inline";
import staff12 from "@/assets/staff-placeholder-12.svg?inline";
import staff13 from "@/assets/staff-placeholder-13.svg?inline";
import staff14 from "@/assets/staff-placeholder-14.svg?inline";
import staff15 from "@/assets/staff-placeholder-15.svg?inline";
import staff16 from "@/assets/staff-placeholder-16.svg?inline";
import staff17 from "@/assets/staff-placeholder-17.svg?inline";
import staff18 from "@/assets/staff-placeholder-18.svg?inline";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Talents College Mukono" },
      {
        name: "description",
        content:
          "Founded in 2002, Talents College Mukono nurtures academic excellence and practical talent in a secure co-educational environment.",
      },
      { property: "og:title", content: "About Us — Talents College Mukono" },
      { property: "og:description", content: "Our history, vision, values and leadership." },
    ],
  }),
  component: About,
});

const values = [
  {
    icon: Award,
    title: "Excellence",
    body: "We hold ourselves to the highest academic and personal standards.",
  },
  {
    icon: Heart,
    title: "Integrity",
    body: "Honesty, respect and responsibility guide every interaction.",
  },
  {
    icon: Users,
    title: "Community",
    body: "We serve one another, our families and the wider Mukono community.",
  },
  {
    icon: Sparkles,
    title: "Creativity",
    body: "We celebrate curiosity and the courage to try new things.",
  },
  {
    icon: Compass,
    title: "Discipline",
    body: "Structure and self-mastery unlock every learner's potential.",
  },
  {
    icon: Target,
    title: "Purpose",
    body: "Every learner leaves with clarity about who they are and where they're going.",
  },
  {
    icon: BookOpen,
    title: "Lifelong learning",
    body: "We instil a love of learning that lasts well beyond the classroom walls.",
  },
  {
    icon: ShieldCheck,
    title: "Respect",
    body: "We honour every person, their dignity, their faith and their effort.",
  },
  {
    icon: HeartHandshake,
    title: "Service",
    body: "We give back — to our school, our families and the wider community.",
  },
];

const whyChooseUs = [
  {
    icon: Award,
    title: "Proven track record",
    body: "Two decades of consistent O' and A' Level results, producing students who thrive in universities and careers across Uganda and beyond.",
  },
  {
    icon: HeartHandshake,
    title: "Every learner known",
    body: "Small class attention with a dedicated class teacher who follows each student's progress and is the first point of contact for parents.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & secure",
    body: "A secure campus, vetted staff and a written safeguarding code that protects every student's welfare, day and boarding alike.",
  },
  {
    icon: Sparkles,
    title: "Talent beyond the classroom",
    body: "Music, dance, drama, sports and clubs run alongside the curriculum so every gift — academic or practical — has room to grow.",
  },
];

const leadership = [
  { name: "The Head Teacher", role: "Head of School", photo: staff01 },
  { name: "Deputy Head Teacher", role: "Assistant Head Teacher", photo: staff02 },
  { name: "Bursar", role: "Finance & Administration", photo: staff03 },
  { name: "Director of Studies", role: "Curriculum & Examinations", photo: staff04 },
  { name: "Deputy Director of Studies", role: "Assistant DOS", photo: staff05 },
];

// TODO(content): Placeholder names for layout purposes only. Replace with the real
// staff directory (with each person's consent to be listed) before launch.
const staff = [
  { name: "Mr. J. Okello", role: "Head Teacher", dept: "Administration", photo: staff06 },
  { name: "Ms. R. Nabwire", role: "Deputy — Academics", dept: "Administration", photo: staff07 },
  { name: "Mr. P. Ssemakula", role: "Deputy — Welfare", dept: "Administration", photo: staff08 },
  { name: "Ms. A. Nakato", role: "HoD Sciences", dept: "Sciences", photo: staff09 },
  { name: "Mr. D. Kayemba", role: "HoD Mathematics", dept: "Mathematics", photo: staff10 },
  { name: "Ms. G. Namutebi", role: "HoD Languages", dept: "Languages", photo: staff11 },
  { name: "Mr. B. Mugisha", role: "HoD Humanities", dept: "Humanities", photo: staff12 },
  { name: "Ms. S. Nabirye", role: "HoD Creative Arts", dept: "Creative Arts", photo: staff13 },
  { name: "Mr. E. Ochieng", role: "ICT Coordinator", dept: "Vocational & Tech", photo: staff14 },
  { name: "Ms. J. Akello", role: "Guidance & Counselling", dept: "Welfare", photo: staff15 },
  { name: "Mr. F. Wasswa", role: "Games Master", dept: "Sports", photo: staff16 },
  { name: "Ms. L. Namubiru", role: "Boarding Matron", dept: "Welfare", photo: staff17 },
];

const staffPrinciples = [
  {
    icon: BookOpen,
    title: "Taught by specialists",
    body: "Every subject is led by a teacher trained in that discipline, working to the national curriculum and moderated within their department. Heads of Department review schemes of work each term and sit in on lessons.",
  },
  {
    icon: HeartHandshake,
    title: "Known, not counted",
    body: "Each student is assigned a class teacher who follows their progress across the year and is the first point of contact for parents. Nobody is left to drift quietly in a large class.",
  },
  {
    icon: ShieldCheck,
    title: "Safeguarding first",
    body: "All staff are vetted before appointment and work to a written code of conduct covering discipline, welfare and student protection. Concerns route straight to the Deputy — Welfare.",
  },
  {
    icon: Award,
    title: "Always learning",
    body: "Teachers attend continuous professional development each term, and departments run internal workshops on marking standards, practical work and examination technique.",
  },
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="A school built on talent, discipline and heart."
        description="Founded in February 2002, Talents College Mukono has grown into a respected private secondary school known for balancing curriculum excellence with practical skill development."
        image={photos.dignitariesWide}
        imageAlt="Talents College staff and students hosting visiting dignitaries"
        crumbs={[{ label: "About" }]}
        layout="feature"
        facts={[
          { value: "2002", label: "Founded" },
          { value: "O & A", label: "Levels offered" },
          { value: "Day & Boarding", label: "Student options" },
          { value: "Mukono", label: "Nabuti Village" },
        ]}
      />

      <Section id="history">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6 text-muted-foreground leading-relaxed">
            <div>
              <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
                Our history
              </div>
              <h2 className="mt-2 font-display font-black text-3xl text-foreground">
                Two decades of nurturing talent.
              </h2>
              <p className="mt-4">
                Talents College Mukono opened its doors in February 2002 with a simple conviction:
                every young person carries a talent worth discovering. Two decades later, that
                conviction has grown into a full O and A Level secondary school registered with
                Uganda's Ministry of Education and Sports (Reg. No. ME/22/3549) and a home to over a
                thousand students each year.
              </p>
              <p className="mt-4">
                Our campus in Nabuti Village, Mukono, sits about a kilometre from Mukono Town
                Council — close enough to the heartbeat of the town, far enough to give our students
                the calm they need to study, play and grow.
              </p>
            </div>
          </div>
          <aside className="bg-muted rounded-2xl p-6 space-y-4 h-fit">
            <div>
              <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
                Quick facts
              </div>
              <h3 className="mt-2 font-display font-bold text-xl">At a glance</h3>
            </div>
            <dl className="text-sm space-y-3">
              {[
                ["Founded", "February 2002"],
                ["Type", "Private · Mixed · Day & Boarding"],
                ["Levels", "'O' and 'A' Level"],
                ["Registration", "ME/22/3549"],
                ["Location", "Nabuti, Mukono"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-4 border-b border-border pb-2 last:border-0"
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-semibold text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </Section>

      <Section id="mission" className="!pt-0">
        <div className="grid md:grid-cols-2 gap-6 md:items-stretch">
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl p-8 md:p-10 bg-muted">
              <div className="flex items-center gap-3">
                <div className="size-11 grid place-items-center rounded-xl bg-flag-red/10 text-flag-red">
                  <CheckCircle2 className="size-5" />
                </div>
                <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
                  Why choose us
                </div>
              </div>
              <h2 className="mt-4 font-display font-black text-3xl">
                A school that earns your trust.
              </h2>
              <CardGrid className="mt-6 grid gap-4 sm:grid-cols-2" stagger={70}>
                {whyChooseUs.map((c) => (
                  <div key={c.title}>
                    <div className="flex items-start gap-2.5">
                      <c.icon className="size-5 shrink-0 text-flag-red mt-0.5" />
                      <h3 className="font-display font-bold text-base leading-tight">{c.title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{c.body}</p>
                  </div>
                ))}
              </CardGrid>
            </div>

            <div className="rounded-3xl p-8 md:p-10 bg-flag-black text-white">
              <div className="text-xs uppercase tracking-widest text-flag-yellow font-semibold">
                Our vision
              </div>
              <h2 className="mt-2 font-display font-black text-3xl">
                To be a leading centre of holistic education in Uganda.
              </h2>
              <p className="mt-4 text-white/80">
                Producing confident, capable and principled young people ready to lead in their
                communities and professions.
              </p>
            </div>

            <div className="rounded-3xl p-8 md:p-10 bg-flag-yellow text-flag-black">
              <div className="text-xs uppercase tracking-widest font-semibold">Our mission</div>
              <h2 className="mt-2 font-display font-black text-3xl">
                Discover talent. Deliver excellence. Develop character.
              </h2>
              <p className="mt-4 opacity-85">
                We provide a secure, versatile learning environment where every student is known,
                stretched academically and supported to grow their unique gifts.
              </p>
            </div>
          </div>

          <div className="rounded-3xl p-8 md:p-10 bg-muted flex flex-col">
            <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
              Core values & principles
            </div>
            <h2 className="mt-2 font-display font-black text-3xl md:text-4xl">
              What we stand for.
            </h2>
            <CardGrid className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" tilt tiltMax={7}>
              {values.map((v) => (
                <div
                  key={v.title}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-flag-red transition-colors"
                >
                  <div className="size-11 grid place-items-center rounded-xl bg-flag-yellow/20 text-flag-red">
                    <v.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-display font-bold text-lg">{v.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{v.body}</p>
                </div>
              ))}
            </CardGrid>
          </div>
        </div>
      </Section>

      <Section id="administration" className="!pt-0">
        <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
          Leadership
        </div>
        <h2 className="mt-2 font-display font-black text-3xl md:text-4xl">
          The people who lead our school.
        </h2>
        <CardGrid className="mt-10 flex gap-4 overflow-x-auto pb-2 snap-x" stagger={60}>
          {leadership.map((p) => (
            <div
              key={p.name}
              className="group relative shrink-0 w-56 aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border snap-start flex flex-col items-center justify-end text-center p-5 transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <img
                src={p.photo}
                alt={p.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-flag-black/90 via-flag-black/30 to-transparent" />
              <div className="relative z-10">
                <div className="font-display font-bold text-base leading-tight text-white">
                  {p.name}
                </div>
                <div className="mt-1 text-sm text-white/80">{p.role}</div>
              </div>
            </div>
          ))}
        </CardGrid>
      </Section>

      <Section id="staff" className="!pt-0">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-flag-red">
            Our staff
          </div>
          <h2 className="mt-2 font-display text-3xl font-black md:text-4xl">
            A school is only as good as the people standing in front of the class.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Since 2002 we have built the staff room deliberately — subject specialists who know
            their syllabus, class teachers who know their students by name, and a welfare team that
            catches problems early. These are the standards every member of staff at Talents College
            works to.
          </p>
        </div>

        <CardGrid className="mt-12 grid gap-5 md:grid-cols-2" tilt tiltMax={6}>
          {staffPrinciples.map((p) => (
            <div
              key={p.title}
              className="rounded-3xl border border-border bg-card p-7 transition-shadow hover:shadow-elegant"
            >
              <div className="grid size-11 place-items-center rounded-xl bg-flag-red/10 text-flag-red">
                <p.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </CardGrid>

        <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-flag-red">
              Directory
            </div>
            <h2 className="mt-2 font-display text-3xl font-black">
              Senior staff & Heads of Department
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            To reach any member of staff, write to the office and mark your message for their
            attention — we will pass it on the same working day.
          </p>
        </div>

        <CardGrid
          className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          tilt
          tiltMax={7}
        >
          {staff.map((s) => (
            <div
              key={s.name}
              className="group relative rounded-2xl overflow-hidden bg-card border border-border aspect-[3/4] transition-all hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <img
                src={s.photo}
                alt={s.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-flag-black/90 via-flag-black/30 to-transparent" />
              <div className="relative z-10 flex flex-col items-center justify-end h-full text-center p-5">
                <div className="font-display text-lg font-bold text-white">{s.name}</div>
                <div className="text-sm font-semibold text-flag-yellow">{s.role}</div>
                <div className="mt-1 text-xs text-white/80">{s.dept}</div>
              </div>
            </div>
          ))}
        </CardGrid>
      </Section>

      <Section id="headteacher" className="!pt-0">
        <div className="rounded-3xl overflow-hidden bg-muted p-8 md:p-12 grid md:grid-cols-[auto_1fr] gap-8 items-center">
          <img
            src={photos.directors}
            alt="The Head Teacher of Talents College Mukono"
            className="size-40 md:size-48 rounded-2xl object-cover object-top w-full md:w-auto"
          />
          <div>
            <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
              Word from the Headteacher
            </div>
            <h2 className="mt-2 font-display font-black text-2xl md:text-3xl">
              "Every child carries a talent worth discovering."
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl leading-relaxed">
              Welcome to Talents College Mukono. For more than twenty years we have held to a simple
              belief — that every young person who walks through our gate deserves to be known,
              challenged and believed in. Our role is to help each student find their gift, build
              their character and leave us ready for the world. I am proud of the discipline, warmth
              and ambition that define our school, and prouder still of the young people who carry
              it forward.
            </p>
            <div className="mt-5">
              <div className="font-display font-bold text-lg">The Head Teacher</div>
              <div className="text-sm text-muted-foreground">Talents College Mukono</div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="rounded-3xl overflow-hidden bg-muted p-8 md:p-12 grid md:grid-cols-[auto_1fr] gap-8 items-start">
          <div className="size-24 md:size-28 grid place-items-center rounded-2xl bg-flag-yellow">
            <Music className="size-10 text-flag-black" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
              School anthem
            </div>
            <h2 className="mt-2 font-display font-black text-2xl md:text-3xl">
              "Rise, Talents, Rise"
            </h2>
            <div className="mt-5 max-w-2xl space-y-5 text-muted-foreground italic leading-relaxed">
              <p>
                Rise, Talents, rise with wisdom in our hands,
                <br />
                We climb the hills of Mukono's golden land,
                <br />
                With truth and toil, with heart and skill,
                <br />
                We build our future, we shape our will,
                <br />
                For God and country, we take our stand.
              </p>
              <p>
                From classroom, lab and field we learn to strive,
                <br />
                To keep the flame of discipline alive,
                <br />
                With every gift that Heaven has given,
                <br />
                We honour earth, we honour Heaven,
                <br />
                And in our labours we shall thrive.
              </p>
              <p>
                So sing, Talents, sing of all we are,
                <br />
                A family united near and far,
                <br />
                With head and hand and courage true,
                <br />
                We lift our school in all we do,
                <br />
                And raise our banner to the star.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
