import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/PageHero";
import { Gallery } from "@/components/gallery/Gallery";
import { fetchMedia } from "@/lib/media";
import { photos } from "@/lib/photos";

/**
 * The full photo gallery.
 *
 * This route was a bare redirect to /media#gallery, which is why "Browse the full
 * gallery" felt broken: the button sat at the bottom of /media and linked to a
 * section a few hundred pixels above it on the same page. Nothing happened because
 * there was nothing to go to.
 *
 * /gallery is now the real destination — every photo, filterable, with the
 * lightbox. /media keeps a short preview strip that links here. The sitemap has
 * been advertising this URL to search engines all along.
 */
export const Route = createFileRoute("/gallery")({
  loader: async () => ({ media: await fetchMedia() }),
  head: () => ({
    meta: [
      { title: "Gallery — Talents College Mukono" },
      {
        name: "description",
        content:
          "Photographs of campus life at Talents College Mukono — classrooms, laboratories, sport, cultural performance and school events.",
      },
      { property: "og:title", content: "Gallery — Talents College Mukono" },
      {
        property: "og:description",
        content: "Campus life at Talents College Mukono, in photographs.",
      },
      { property: "og:image", content: photos.campusAvenue },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { media } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Every photograph, in one place."
        description="Classrooms and laboratories, sport and cultural performance, assemblies and visiting days. Filter by what you want to see, then tap any photo to open it."
        image={photos.girlsPose}
        imageAlt="Students on the campus walkway at Talents College Mukono"
        crumbs={[{ label: "Media", to: "/media" }, { label: "Gallery" }]}
        tone="cream"
        layout="split"
      />

      <Section id="gallery">
        <Gallery photos={media} />
      </Section>
    </>
  );
}
