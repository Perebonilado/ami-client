import type { Poster } from "@/lib/types";
import { Play } from "lucide-react";

/**
 * A video thumbnail. Uses the real thumbnail when there is one,
 * otherwise a generated poster in the video's colours.
 */
export function VideoThumb({
  thumbnailUrl,
  poster,
  title,
  className = "",
  showPlay = true,
  children,
}: {
  thumbnailUrl: string | null;
  poster: Poster;
  title: string;
  className?: string;
  showPlay?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-ink ${className}`}
      style={thumbnailUrl ? undefined : { backgroundImage: `linear-gradient(150deg, ${poster.from}, ${poster.to})` }}
    >
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbnailUrl} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <>
          <div className="absolute inset-0 opacity-25 mix-blend-overlay [background:radial-gradient(circle_at_20%_15%,white,transparent_45%)]" aria-hidden />
          <p className="absolute inset-x-4 bottom-4 line-clamp-3 pr-12 text-[19px] leading-[1.15] font-extrabold tracking-tight text-white/95 drop-shadow-[0_1px_8px_rgb(0_0_0/0.25)]" aria-hidden>
            {title}
          </p>
        </>
      )}
      {showPlay && (
        <span className="absolute top-3 left-3 flex size-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur" aria-hidden>
          <Play size={14} fill="currentColor" className="translate-x-px" />
        </span>
      )}
      {children}
    </div>
  );
}
