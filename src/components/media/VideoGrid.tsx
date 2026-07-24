import { useState } from "react";
import { Play, Video as VideoIcon } from "lucide-react";
import { CardGrid } from "@/components/motion";
import { youtubeId, type VideoItem } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Click-to-play video wall.
 *
 * Nothing loads until a tile is clicked. A page with a dozen YouTube iframes
 * pulls well over a megabyte of player code before anyone presses anything,
 * which matters a great deal on a Ugandan mobile connection. Until then each
 * tile is a single thumbnail image.
 *
 * Handles both sources the admin form accepts: a pasted YouTube link (embedded)
 * and a file uploaded to the media bucket (played natively).
 */
export function VideoGrid({ videos }: { videos: VideoItem[] }) {
  if (videos.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
        <VideoIcon className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-4 font-display text-lg font-bold">No videos published yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Videos added from the admin media page appear here as soon as they are marked published.
        </p>
      </div>
    );
  }

  return (
    <CardGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={60}>
      {videos.map((v) => (
        <VideoTile key={v.id} video={v} />
      ))}
    </CardGrid>
  );
}

function VideoTile({ video }: { video: VideoItem }) {
  const [playing, setPlaying] = useState(false);
  const ytId = youtubeId(video.url);

  // YouTube's own thumbnail saves the admin from having to upload one; an
  // explicitly uploaded thumbnail still wins if there is one.
  const poster =
    video.thumbnail_url ?? (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null);

  return (
    <figure className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="relative aspect-video bg-flag-black">
        {playing ? (
          ytId ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              className="absolute inset-0 h-full w-full object-contain"
              src={video.url}
              poster={poster ?? undefined}
              controls
              autoPlay
              preload="metadata"
            />
          )
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${video.title}`}
            className="group absolute inset-0 h-full w-full"
          >
            {poster ? (
              <img
                src={poster}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : null}
            <span className="absolute inset-0 bg-flag-black/30 transition-colors group-hover:bg-flag-black/15" />
            <span
              className={cn(
                "absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center",
                "rounded-full bg-white/90 text-flag-black shadow-elegant",
                "transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none",
              )}
            >
              <Play className="size-6 translate-x-0.5 fill-current" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="p-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-flag-red">
          {video.category}
        </div>
        <h3 className="mt-2 font-display text-lg font-bold leading-tight">{video.title}</h3>
      </figcaption>
    </figure>
  );
}
