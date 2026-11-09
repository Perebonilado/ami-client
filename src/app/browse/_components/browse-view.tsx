"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/page";
import { VideoCard, VideoCardSkeleton } from "@/components/video-card";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/pricing";
import { useApi } from "@/lib/use-api";

const chip =
  "h-9 shrink-0 rounded-full border border-line bg-white px-4 text-sm font-semibold text-muted transition-colors select-none hover:border-line-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink data-pressed:border-ink data-pressed:bg-ink data-pressed:text-white";

export function BrowseView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const category = params.get("category") ?? "";
  const q = params.get("q") ?? "";
  const [text, setText] = useState(q);

  // Keep the URL in step with the search box, after a short pause in typing.
  useEffect(() => {
    const t = setTimeout(() => {
      if (text.trim() === q) return;
      const next = new URLSearchParams(params.toString());
      if (text.trim()) next.set("q", text.trim());
      else next.delete("q");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }, 250);
    return () => clearTimeout(t);
  }, [text, q, params, pathname, router]);

  const setCategory = (c: string) => {
    const next = new URLSearchParams(params.toString());
    if (c) next.set("category", c);
    else next.delete("category");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const { data, error, loading } = useApi(() => api.listVideos({ q, category }), [q, category]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="relative max-w-xl">
          <Search size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <label htmlFor="browse-search" className="sr-only">
            Search videos
          </label>
          <input
            id="browse-search"
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search by title, creator or tag"
            className="h-12 w-full rounded-full border border-line bg-white pr-11 pl-11 text-[15px] placeholder:text-faint focus:border-ink focus:ring-4 focus:ring-ink/8 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {text && (
            <button
              type="button"
              onClick={() => setText("")}
              className="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-sunken hover:text-ink"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <ToggleGroup
          aria-label="Filter by category"
          value={[category || "all"]}
          onValueChange={(v) => setCategory(v[0] && v[0] !== "all" ? v[0] : "")}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          <Toggle value="all" className={chip}>
            All
          </Toggle>
          {CATEGORIES.map((c) => (
            <Toggle key={c} value={c} className={chip}>
              {c}
            </Toggle>
          ))}
        </ToggleGroup>
      </div>

      {error ? (
        <EmptyState title="Couldn't load videos">{error.message}</EmptyState>
      ) : loading && !data ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : data && data.videos.length === 0 ? (
        <EmptyState
          title="No videos match that"
          action={
            <LinkButton href="/browse" variant="secondary" size="sm" onClick={() => setText("")}>
              Clear filters
            </LinkButton>
          }
        >
          Try a creator&apos;s name, a tag like &ldquo;lagos&rdquo;, or another category.
        </EmptyState>
      ) : (
        <>
          <p className="text-sm text-muted tabular" aria-live="polite">
            {data?.videos.length} {data?.videos.length === 1 ? "video" : "videos"}
            {category && ` in ${category}`}
            {q && ` matching “${q}”`}
          </p>
          <div className={`grid grid-cols-2 gap-x-3 gap-y-5 transition-opacity sm:grid-cols-3 lg:grid-cols-4 ${loading ? "opacity-60" : ""}`}>
            {data?.videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
