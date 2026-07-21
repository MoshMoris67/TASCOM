import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/PageHero";
import { CardGrid, Magnetic } from "@/components/motion";
import { Users, Award, Handshake, ArrowRight } from "lucide-react";
import alumni1 from "@/assets/alumni1.jpeg";
import alumniInauguration from "@/assets/alumniinauguration.jpeg";
import alumniPlanting from "@/assets/alumniplanting.jpeg";
import alumniSports from "@/assets/alumnisports.jpeg";

export const Route = createFileRoute("/alumni")({
  head: () => ({
    meta: [
      { title: "Alumni — Talents College Mukono" },
      { name: "description", content: "Alumni stories, reunions and giving at Talents College Mukono." },
      { property: "og:title", content: "Alumni — Talents College Mukono" },
      { property: "og:description", content: "Meet our alumni, learn their stories and join the Talents College community." },
      { property: "og:image", content: alumni1 },
    ],
  }),
  component: Alumni,
});

const stories = [
  {
    title: "Our first reunion gala",
    description: "A joyful return of Talents College alumni to celebrate school growth, mentorship and giving back.",
    image: alumniInauguration,
  },
  {
    title: "Planting a better future",
    description: "Graduates joined current students for a community tree-planting day at our campus grounds.",
    image: alumniPlanting,
  },
  {
    title: "Sports, leadership and lifelong friendships",
    description: "Former students reunited for a friendly athletics day, featuring alumni football and netball teams.",
    image: alumniSports,
  },
];

function Alumni() {
  return (
    <>
      <PageHero
        eyebrow="Alumni"
        title="Talents College graduates, leaders and community builders."
        description="Explore our alumni stories, reunion highlights and ways to stay connected with the college family."
        image={alumni1}
        imageAlt="Talents College alumni at a reunion gathering"
        crumbs={[{ label: "Alumni" }]}
        tone="ink"
        layout="split"
      />

      <Section>
        <CardGrid className="grid gap-6 lg:grid-cols-3" tilt>
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="inline-flex items-center justify-center rounded-3xl bg-flag-yellow p-4 text-flag-black">
              <Users className="size-6" />
            </div>
            <h2 className="mt-6 text-3xl font-display font-black">Our community</h2>
            <p className="mt-4 text-muted-foreground">Talents College alumni stay connected through mentorship, networking and support for the next generation.</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="inline-flex items-center justify-center rounded-3xl bg-flag-yellow p-4 text-flag-black">
              <Award className="size-6" />
            </div>
            <h2 className="mt-6 text-3xl font-display font-black">Achievements</h2>
            <p className="mt-4 text-muted-foreground">From careers in education to entrepreneurship, our graduates help define the future of Mukono and beyond.</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="inline-flex items-center justify-center rounded-3xl bg-flag-yellow p-4 text-flag-black">
              <Handshake className="size-6" />
            </div>
            <h2 className="mt-6 text-3xl font-display font-black">Giving back</h2>
            <p className="mt-4 text-muted-foreground">Alumni support scholarship funds, campus improvements and leadership sessions for current students.</p>
          </div>
        </CardGrid>
      </Section>

      <Section>
        <CardGrid className="grid gap-6 lg:grid-cols-3" tilt>
          {stories.map((story) => (
            <article key={story.title} className="overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
              <img src={story.image} alt={story.title} className="h-64 w-full object-cover" />
              <div className="p-6">
                <h3 className="font-display text-2xl font-bold">{story.title}</h3>
                <p className="mt-3 text-muted-foreground">{story.description}</p>
              </div>
            </article>
          ))}
        </CardGrid>
      </Section>

      <Section className="!pt-0">
        <div className="rounded-3xl border border-border bg-card p-8 lg:flex lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-flag-yellow font-semibold">Join the network</div>
            <h2 className="mt-2 font-display text-3xl font-black">Stay connected with Talents College Alumni.</h2>
            <p className="mt-3 text-muted-foreground">Sign up for updates, mentorship opportunities and reunion invitations.</p>
          </div>
          {/*
            Was a bare <button> with no onClick — it had a hover state and a cursor,
            so it looked live, and it did nothing. There is no alumni register to
            write to yet, so it goes to the contact form, which reaches the same
            office that would maintain one. The label now says what happens.
          */}
          <Magnetic className="mt-6 shrink-0 lg:mt-0">
            <Link
              to="/contact"
              search={{ subject: "Alumni network" }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-flag-red px-6 py-3 font-semibold text-white transition-colors hover:bg-flag-yellow hover:text-flag-black"
            >
              Join the alumni network <ArrowRight className="size-4" />
            </Link>
          </Magnetic>
        </div>
      </Section>
    </>
  );
}
