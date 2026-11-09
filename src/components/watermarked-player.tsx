"use client";

import { AmiMark } from "./logo";

/** Preview player with a visible Àmì watermark over the video. The clean file is only for licence holders. */
export function WatermarkedPlayer({ src, poster, title }: { src: string; poster?: string; title: string }) {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-ink">
      <video
        src={poster ? src : `${src}#t=0.5`}
        poster={poster}
        preload="metadata"
        controls
        playsInline
        loop
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        className="aspect-[4/5] w-full object-cover"
        aria-label={`Preview of ${title}`}
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-16 overflow-hidden" aria-hidden>
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex -rotate-[18deg] gap-10 whitespace-nowrap text-white/22 select-none">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="text-2xl font-extrabold tracking-[0.2em] uppercase">
                Àmì preview
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/45 py-1.5 pr-3 pl-1.5 text-xs font-bold text-white backdrop-blur" aria-hidden>
        <span className="flex size-6 items-center justify-center rounded-full bg-white">
          <AmiMark size={16} />
        </span>
        Watermarked preview
      </div>
    </div>
  );
}
