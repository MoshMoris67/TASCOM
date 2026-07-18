import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MapPin,
  Play,
  Quote,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { photos } from "@/lib/photos";
import badge from "@/assets/badge.png";
import { school } from "@/lib/school-info";

export const Route = createFileRoute("/")({
  component: Home,
});

const highlights = [
  { icon: BookOpen, title: "O & A Level Excellence", body: "A rigorous curriculum aligned to Uganda's Ministry of Education, delivered by dedicated educators." },
  { icon: Sparkles, title: "Talent Development", body: "Beyond academics — practical skills, arts, sports and enterprise projects that shape whole people." },
  { icon: ShieldCheck, title: "Safe Boarding & Day", body: "A secure, well-supervised environment for boarders and day scholars alike." },
  { icon: Users, title: "Community First", body: "Active engagement with parents, alumni and Mukono through galas, sports and service days." },
];

const stats = [
  { value: 24, suffix: "+", label: "Years of excellence" },
  { value: 1200, suffix: "+", label: "Students empowered" },
  { value: 45, suffix: "+", label: "Skilled teachers" },
  { value: 30, suffix: "+", label: "Clubs & sports" },
];

const news = [
  { tag: "Announcement", date: "2026-07-01", title: "Term 2 opening date confirmed", excerpt: "Students should report on Sunday. See the full calendar for boarders and day scholars." },
  { tag: "Achievement", date: "2026-06-14", title: "Science fair: 3 innovations shortlisted", excerpt: "Our Senior 5 team's solar water purifier advances to the national finals." },
  { tag: "Event", date: "2026-06-02", title: "Alumni vs Students gala this Saturday", excerpt: "Football, netball and athletics — everyone welcome from 9AM at the school field." },
];

const events = [
  { d: 26, m: "Jul", title: "Parents' consultation day", time: "9:00 AM · Main Hall" },
  { d: 3, m: "Aug", title: "Inter-house athletics", time: "8:00 AM · School field" },
  { d: 15, m: "Aug", title: "S.6 mock examinations begin", time: "All week" },
  { d: 30, m: "Aug", title: "Career & talent expo", time: "10:00 AM · ICT Lab" },
];

// TODO(content): These are placeholder names and quotes for layout purposes only.
// Before launch, replace with real testimonials collected with the explicit consent
// of the named parent/student/alumnus — do not publish quotes attributed to invented people.
const testimonials = [
  { q: "The teachers genuinely know each student. My daughter's confidence in sciences transformed here.", a: "— Sarah N., Parent" },
  { q: "The boarding house feels like home. I've grown as a leader through the debate club.", a: "— Brian K., S.5 Student" },
  { q: "Talents College Mukono balances discipline with creativity — that combination is rare and it works.", a: "— Rev. James M., Alumnus" },
];

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1600;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <>{n.toLocaleString()}{suffix}</>;
}

function Home() {
  const [slide, setSlide] = useState(0);
  const slides = [photos.hero, photos.campusAvenue, photos.labWide, photos.library, photos.dignitariesWide];
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const [testi, setTesti] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTesti((s) => (s + 1) % testimonials.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {slides.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              width={1920}
              height={1280}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === slide ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-flag-black/70 via-flag-black/55 to-flag-black/90" />
        </div>

        <div className="relative container-page min-h-[92vh] flex items-end pb-16 md:pb-24 pt-24 text-white">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs uppercase tracking-widest">
              <span className="size-1.5 rounded-full bg-flag-yellow animate-shimmer" />
              Est. 2002 · Mukono, Uganda
            </div>
            <h1 className="mt-5 font-display font-black text-4xl sm:text-5xl md:text-7xl leading-[1.02]">
              Nurturing Talents,{" "}
              <span className="text-flag-yellow">Shaping Futures.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-white/85 max-w-xl">
              A private co-educational day &amp; boarding secondary school offering 'O' and 'A'
              Level education — where curriculum meets practical talent.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/admissions"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-flag-red text-white font-semibold shadow-elegant hover:opacity-90"
              >
                Start your application
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white/10 backdrop-blur border border-white/25 font-semibold hover:bg-white/20"
              >
                <Play className="size-4" />
                Discover the school
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-4">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`h-1 rounded-full transition-all ${i === slide ? "w-10 bg-flag-yellow" : "w-5 bg-white/40"}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
              <div className="ml-4 flex gap-2">
                <button onClick={() => setSlide((s) => (s - 1 + slides.length) % slides.length)} aria-label="Previous" className="size-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20"><ChevronLeft className="size-4" /></button>
                <button onClick={() => setSlide((s) => (s + 1) % slides.length)} aria-label="Next" className="size-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20"><ChevronRight className="size-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-y border-border bg-flag-yellow text-flag-black overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee py-3 font-semibold uppercase text-sm tracking-widest">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex shrink-0">
              {["Admissions Open 2027", "O & A Level", "Day & Boarding", "Reg. ME/22/3549", "Alumni Gala · Sat", "Career Expo · Aug 30"].map((t, i) => (
                <span key={i} className="mx-8 flex items-center gap-8">
                  {t}<span className="size-1.5 rounded-full bg-flag-red" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* WELCOME */}
      <section className="container-page py-20 md:py-28 grid gap-12 md:grid-cols-12 items-center">
        <div className="md:col-span-5">
          <div className="relative">
            <img src={photos.library} alt="Head Teacher's welcome" width={1280} height={960} loading="lazy" className="rounded-3xl shadow-elegant aspect-[4/5] object-cover" />
            <div className="absolute -bottom-6 -right-4 md:-right-8 bg-flag-black text-white p-5 rounded-2xl max-w-[240px] shadow-elegant flex gap-3 items-start">
              <img src={badge} alt="" className="size-12 shrink-0 object-contain" />
              <p className="text-sm leading-relaxed">A school where every learner's gift is discovered — and stretched.</p>
            </div>
          </div>
        </div>
        <div className="md:col-span-7">
          <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">From the Head Teacher</div>
          <h2 className="mt-2 font-display font-black text-3xl md:text-5xl leading-tight">A warm welcome to Talents College Mukono.</h2>
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            <p>
              For over two decades we have balanced strong curriculum performance with active
              talent and practical skill development. Our aim is simple: to help every young
              person we teach discover what they are good at — and then get remarkably better at it.
            </p>
            <p>
              You will find a school that is disciplined, warm, and unafraid to try new things.
              We welcome you to visit, ask questions and, if you are ready, join a community that
              takes learning — and life — seriously.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="size-14 rounded-full bg-flag-yellow grid place-items-center font-display font-bold text-flag-black">HT</div>
            <div>
              <div className="font-semibold">The Head Teacher</div>
              <div className="text-sm text-muted-foreground">Talents College Mukono</div>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="bg-muted/40 border-y border-border py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">Why Talents College Mukono</div>
            <h2 className="mt-2 font-display font-black text-3xl md:text-5xl">A well-rounded, future-ready education.</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((h) => (
              <div key={h.title} className="group bg-card border border-border rounded-2xl p-6 hover:shadow-elegant hover:-translate-y-1 transition-all">
                <div className="size-12 rounded-xl bg-flag-black grid place-items-center group-hover:bg-flag-red transition-colors">
                  <h.icon className="size-6 text-flag-yellow" />
                </div>
                <h3 className="mt-5 font-display font-bold text-lg">{h.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="container-page py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center border border-border rounded-2xl p-6 bg-card">
              <div className="font-display font-black text-4xl md:text-5xl text-gradient-brand">
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWS & EVENTS */}
      <section className="container-page py-16 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">Latest News</div>
              <h2 className="mt-2 font-display font-black text-3xl md:text-4xl">What's happening on campus.</h2>
            </div>
            <Link to="/news" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold hover:text-flag-red">
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {news.map((n) => (
              <article key={n.title} className="group grid grid-cols-[auto_1fr] gap-5 p-5 rounded-2xl border border-border bg-card hover:border-flag-red transition-colors">
                <div className="size-16 grid place-items-center rounded-xl bg-flag-yellow text-flag-black font-display font-bold">
                  <div className="text-center leading-none">
                    <div className="text-xl">{new Date(n.date).getDate()}</div>
                    <div className="text-[10px] uppercase mt-0.5">{new Date(n.date).toLocaleString("en", { month: "short" })}</div>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-flag-red/10 text-flag-red font-semibold">{n.tag}</span>
                    <span className="text-muted-foreground">{new Date(n.date).toDateString()}</span>
                  </div>
                  <h3 className="mt-1.5 font-display font-bold text-lg truncate group-hover:text-flag-red">{n.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">Upcoming Events</div>
          <h2 className="mt-2 font-display font-black text-3xl">On the calendar.</h2>
          <div className="mt-6 space-y-3">
            {events.map((e) => (
              <div key={e.title} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="size-14 rounded-lg bg-flag-black text-white grid place-items-center shrink-0">
                  <div className="text-center leading-none">
                    <div className="text-xl font-bold">{e.d}</div>
                    <div className="text-[10px] uppercase mt-0.5 text-flag-yellow">{e.m}</div>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{e.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="size-3" /> {e.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS SNAPSHOT */}
      <section className="container-page py-20 grid gap-4 md:grid-cols-3">
        {[
          { img: photos.examWriting, title: "Ordinary Level (O)", desc: "Senior 1–4. A broad foundation across sciences, humanities and languages preparing students for UCE.", href: "/academics" },
          { img: photos.labFlaskHold, title: "Advanced Level (A)", desc: "Senior 5–6. Specialised subject combinations preparing students for university and career pathways.", href: "/academics" },
          { img: photos.culture1, title: "Talents Program", desc: "Music, dance, drama, sports, ICT and enterprise clubs — every student develops at least one talent.", href: "/student-life" },
        ].map((c) => (
          <Link to={c.href} key={c.title} className="group relative rounded-3xl overflow-hidden aspect-[4/5] block">
            <img src={c.img} alt="" width={1280} height={960} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-flag-black via-flag-black/30 to-transparent" />
            <div className="absolute inset-0 p-7 flex flex-col justify-end text-white">
              <h3 className="font-display font-black text-2xl">{c.title}</h3>
              <p className="mt-2 text-sm text-white/85 line-clamp-3">{c.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-flag-yellow">
                Learn more <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* TESTIMONIAL */}
      <section className="bg-flag-black text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,var(--flag-yellow),transparent_40%),radial-gradient(circle_at_80%_70%,var(--flag-red),transparent_45%)]" />
        <div className="relative container-page text-center max-w-3xl mx-auto">
          <Quote className="size-10 text-flag-yellow mx-auto" />
          <blockquote key={testi} className="animate-fade-in mt-6 font-display text-2xl md:text-3xl leading-snug">
            "{testimonials[testi].q}"
          </blockquote>
          <div className="mt-4 text-white/70">{testimonials[testi].a}</div>
          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTesti(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`h-1 rounded-full ${i === testi ? "w-10 bg-flag-yellow" : "w-4 bg-white/25"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20">
        <div className="relative rounded-3xl overflow-hidden bg-flag-red p-10 md:p-16 text-white">
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-flag-yellow/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-flag-black/30 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs uppercase tracking-widest opacity-80 font-semibold">Admissions 2027</div>
              <h2 className="mt-2 font-display font-black text-3xl md:text-5xl">Ready to join Talents College Mukono?</h2>
              <p className="mt-4 text-white/85 max-w-md">
                Applications for S.1 and S.5 are now open. Reserve a place, book a campus visit
                or speak directly with the head teacher.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/admissions" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-flag-black text-flag-yellow font-semibold hover:bg-flag-black/80">
                  Apply online <ArrowRight className="size-4" />
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white/10 border border-white/30 font-semibold hover:bg-white/20">
                  Book a visit
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-2xl p-5 backdrop-blur">
                <MapPin className="size-6 text-flag-yellow" />
                <div className="mt-3 text-sm opacity-85">Find us</div>
                <div className="font-semibold text-sm mt-1">{school.address.physical}</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-5 backdrop-blur">
                <Award className="size-6 text-flag-yellow" />
                <div className="mt-3 text-sm opacity-85">Registered</div>
                <div className="font-semibold text-sm mt-1">Ministry of Education — {school.registration}</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-5 backdrop-blur">
                <GraduationCap className="size-6 text-flag-yellow" />
                <div className="mt-3 text-sm opacity-85">Programs</div>
                <div className="font-semibold text-sm mt-1">O &amp; A Level · Day &amp; Boarding</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-5 backdrop-blur">
                <Calendar className="size-6 text-flag-yellow" />
                <div className="mt-3 text-sm opacity-85">Founded</div>
                <div className="font-semibold text-sm mt-1">{school.founded}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
