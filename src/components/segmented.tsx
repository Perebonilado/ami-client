"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/** A row of options with a white pill that slides to the chosen one. Works as a radio group. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const ind = useRef<HTMLSpanElement>(null);

  const place = useCallback(() => {
    const b = box.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]');
    if (!b || !ind.current) return;
    ind.current.style.width = `${b.offsetWidth}px`;
    ind.current.style.transform = `translateX(${b.offsetLeft}px)`;
  }, []);

  useLayoutEffect(place, [value, place]);
  useEffect(() => {
    addEventListener("resize", place);
    document.fonts?.ready.then(place);
    return () => removeEventListener("resize", place);
  }, [place]);

  const move = (dir: number) => {
    const i = options.findIndex((o) => o.value === value);
    const next = options[(i + dir + options.length) % options.length];
    onChange(next.value);
    requestAnimationFrame(() => box.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus());
  };

  return (
    <div
      ref={box}
      className="seg"
      role="radiogroup"
      aria-label={label}
      onKeyDown={(e) => {
        const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        move(dir);
      }}
    >
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={o.value === value} tabIndex={o.value === value ? 0 : -1} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
      <span ref={ind} className="ind" aria-hidden />
    </div>
  );
}
