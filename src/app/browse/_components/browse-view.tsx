"use client";

import { Menu } from "@base-ui/react/menu";
import { ArrowUpDown, Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ClipCard } from "@/components/clip-card";
import { CATEGORY_ICONS } from "@/components/icons";
import { Loading } from "@/components/loading";
import { SearchBar } from "@/components/search-bar";
import { CATEGORIES } from "@/lib/pricing";
import type { Video } from "@/lib/types";
import { errorMessage, useListVideosQuery } from "@/store/api";

const RAIL = ["All", ...CATEGORIES];
const SORTS = [
  { value: "new", label: "Newest" },
  { value: "low", label: "Price: low to high" },
  { value: "high", label: "Price: high to low" },
] as const;
type Sort = (typeof SORTS)[number]["value"];

const NEW_DAYS = 7;

export function BrowseView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlQ = params.get("q") ?? "";
  const urlCat = params.get("cat") ?? "";
  const cat = RAIL.includes(urlCat) && urlCat !== "All" ? urlCat : "";

  const [text, setText] = useState(urlQ);
  const [query, setQuery] = useState(urlQ);
  const [sort, setSort] = useState<Sort>("new");

  // A search from the nav changes ?q= while this page may still be kept alive in the background
  const [seenQ, setSeenQ] = useState(urlQ);
  if (urlQ !== seenQ) {
    setSeenQ(urlQ);
    if (urlQ !== query) {
      setText(urlQ);
      setQuery(urlQ);
    }
  }

  // Search as people type, without firing on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setQuery(text.trim()), 450);
    return () => clearTimeout(t);
  }, [text]);

  // Keep the URL shareable: ?q=…&cat=…
  useEffect(() => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (cat) next.set("cat", cat);
    const qs = next.toString();
    if (qs !== params.toString()) router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [query, cat, params, pathname, router]);

  const { currentData, data: lastData, error, isFetching } = useListVideosQuery({ q: query || undefined, category: cat || undefined });
  // While a new search loads, keep showing the last results instead of flashing empty
  const data = currentData ?? lastData;
  const loading = isFetching && !currentData;

  const pickCat = (c: string) => {
    const next = new URLSearchParams(params.toString());
    if (c === "All") next.delete("cat");
    else next.set("cat", c);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const videos = sortVideos(data?.videos ?? [], sort);
  const count = `${videos.length} ${videos.length === 1 ? "video" : "videos"}`;

  return (
    <>
      <section className="finder wrap" aria-label="Search videos">
        <SearchBar value={text} onChange={setText} />
      </section>

      <CategoryRail active={cat || "All"} onPick={pickCat} />

      <section className="wrap" aria-labelledby="results-h">
        <div className="results-head">
          <h1 id="results-h" aria-live="polite">
            {loading ? "Videos" : query ? `${count} for “${query}”` : count}
          </h1>
          <SortMenu value={sort} onChange={setSort} />
        </div>

        {error ? (
          <div className="empty">
            <h2>We couldn’t load videos</h2>
            <p>{errorMessage(error)}</p>
          </div>
        ) : loading && !data ? (
          <Loading label="Loading videos" />
        ) : videos.length === 0 ? (
          <div className="empty">
            <h2>No clips match that yet</h2>
            <p>Try different words, or describe the moment another way.</p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setText("");
                setQuery("");
                pickCat("All");
              }}
            >
              Show all videos
            </button>
          </div>
        ) : (
          <div className="cards">
            {videos.map((v) => (
              <ClipCard
                key={v.id}
                href={`/videos/${v.id}`}
                title={v.title}
                subtitle={v.creator.name}
                verified={v.creator.verified}
                durationSec={v.durationSec}
                thumbnailUrl={v.thumbnailUrl}
                poster={v.poster}
                previewUrl={v.previewUrl}
                badge={isNew(v) ? <span className="badge-new">New</span> : null}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function sortVideos(videos: Video[], sort: Sort) {
  if (sort === "low") return [...videos].sort((a, b) => a.basePriceKobo - b.basePriceKobo);
  if (sort === "high") return [...videos].sort((a, b) => b.basePriceKobo - a.basePriceKobo);
  return videos; // the API already returns newest first, or best match first when searching
}

function isNew(v: Video) {
  return Date.now() - new Date(v.createdAt).getTime() < NEW_DAYS * 24 * 60 * 60 * 1000;
}

/** Icon-and-label categories that stick under the nav while scrolling. */
function CategoryRail({ active, onPick }: { active: string; onPick: (c: string) => void }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    if (!sentinel.current) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { rootMargin: "-140px 0px 0px 0px" });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className={`rail-wrap${stuck ? " is-stuck" : ""}`}>
        <div className="wrap">
          <div className="rail" role="group" aria-label="Category">
            {RAIL.map((c) => {
              const Icon = CATEGORY_ICONS[c];
              return (
                <button key={c} type="button" className="cat-btn" aria-pressed={active === c} onClick={() => onPick(c)}>
                  <Icon aria-hidden />
                  {c}
                </button>
              );
            })}
          </div>
        </div>
        <div className="rail-line" />
      </div>
      <div ref={sentinel} style={{ height: 1, marginTop: -1 }} aria-hidden />
    </>
  );
}

function SortMenu({ value, onChange }: { value: Sort; onChange: (v: Sort) => void }) {
  return (
    <Menu.Root>
      <Menu.Trigger className="sort-btn" aria-label="Sort videos">
        <ArrowUpDown aria-hidden />
        {SORTS.find((s) => s.value === value)!.label}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end" className="z-50 outline-none">
          <Menu.Popup className="pop-list">
            <Menu.RadioGroup value={value} onValueChange={(v) => onChange(v as Sort)}>
              {SORTS.map((s) => (
                <Menu.RadioItem key={s.value} value={s.value} className="pop-opt" closeOnClick>
                  {s.label}
                  <Check aria-hidden />
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
