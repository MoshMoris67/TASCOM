import { supabase } from "@/integrations/supabase/client";
import { galleryPhotos } from "@/lib/photos";
import type { GalleryPhoto } from "@/components/gallery/Gallery";

export type MediaItem = {
  id: string;
  kind: "photo" | "video";
  title: string;
  category: string;
  url: string;
  thumbnail_url: string | null;
  published: boolean;
};

/**
 * Published photos for the public gallery: admin uploads first, then the seed set.
 *
 * Ordering matters here and used to be backwards. The seed set is 33 photos long,
 * so `[...galleryPhotos, ...mapped]` buried every newly uploaded photo below three
 * screens of scrolling — an admin would upload something, look at the page, see no
 * change, and reasonably conclude the upload had failed. Newest-first is also what
 * the query already asks the database for; the spread threw that ordering away.
 *
 * The seed set still backstops an empty or unreachable table, so the gallery never
 * renders blank.
 */
export async function fetchMedia(): Promise<GalleryPhoto[]> {
  try {
    const { data, error } = await supabase
      .from("media")
      .select("id, kind, title, category, url, thumbnail_url, published")
      .eq("published", true)
      .eq("kind", "photo")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return galleryPhotos;

    const mapped: GalleryPhoto[] = (data as MediaItem[]).map((m) => ({
      src: m.url,
      cat: m.category || "Campus",
      alt: m.title || "Talents College Mukono",
    }));

    // Drop any seed photo an admin has since re-uploaded, so the same picture
    // never shows up twice in the grid.
    const uploaded = new Set(mapped.map((m) => m.src));
    return [...mapped, ...galleryPhotos.filter((p) => !uploaded.has(p.src))];
  } catch {
    return galleryPhotos;
  }
}
