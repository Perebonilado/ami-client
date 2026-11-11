"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const HINTS = ["Try “bride dancing at a wedding”", "Try “jollof rice”", "Try “man laughing”", "Try “Aisha Bello”"];

/**
 * One calm search bar, used on Browse and (smaller) in the nav.
 * While it's empty, the placeholder rotates through example searches.
 */
export function SearchBar({
  value,
  onChange,
  onSubmit,
  compact = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: (v: string) => void;
  compact?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [hint, setHint] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = matchMedia(compact ? "(max-width: 860px)" : "(max-width: 480px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => mq.removeEventListener("change", sync);
    const t = setInterval(() => {
      // The small nav bar on phones keeps a short, fixed placeholder
      if ((compact && mq.matches) || input.current?.value || document.activeElement === input.current) return;
      setSwapping(true);
      setTimeout(() => {
        setHint((h) => (h + 1) % (HINTS.length + 1));
        setSwapping(false);
      }, 350);
    }, 3200);
    return () => {
      clearInterval(t);
      mq.removeEventListener("change", sync);
    };
  }, [compact]);

  const base = compact && narrow ? "Search videos" : narrow ? "Search or describe a moment" : "Search creators, titles or describe a moment";
  const placeholder = hint === 0 || (compact && narrow) ? base : HINTS[hint - 1];

  return (
    <form
      className={`search${compact ? " is-compact" : ""}`}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value.trim());
      }}
    >
      <Search aria-hidden />
      <input
        ref={input}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={swapping ? "is-swapping" : undefined}
        aria-label="Search videos"
        autoComplete="off"
        enterKeyHint="search"
      />
      {value && (
        <button
          type="button"
          className="clear"
          aria-label="Clear search"
          onClick={() => {
            onChange("");
            input.current?.focus();
          }}
        >
          <X aria-hidden />
        </button>
      )}
    </form>
  );
}
