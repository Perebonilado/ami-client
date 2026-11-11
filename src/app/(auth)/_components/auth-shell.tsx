"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Logo } from "@/components/logo";

/** Only follow `?next=` to a page on this site. */
export function safeNext(next: string | null, fallback = "/browse") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

/** Bare layout for log in and sign up: logo and a swap link above the form, a looping creator video beside it. */
export function AuthShell({ swap, children }: { swap: { href: string; label: string }; children: ReactNode }) {
  const art = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) art.current?.play().catch(() => {});
  }, []);

  return (
    <div className="p-auth wrap">
      <div className="side">
        <div className="side-top">
          <Logo />
          <Link className="swap" href={swap.href}>
            {swap.label}
          </Link>
        </div>
        <div className="form-wrap">{children}</div>
      </div>
      <div className="art" aria-hidden>
        <video
          ref={art}
          muted
          loop
          playsInline
          preload="auto"
          poster="https://images.pexels.com/videos/5664462/african-dancing-headphones-listening-5664462.jpeg?auto=compress&cs=tinysrgb&w=1400"
          src="https://videos.pexels.com/video-files/5664462/5664462-hd_1280_720_50fps.mp4"
        />
      </div>
    </div>
  );
}

/** Password input with a Show/Hide button. */
export function PasswordInput({ id, value, onChange, autoComplete, placeholder }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; placeholder?: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="pw">
      <input className="input" id={id} type={shown ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} placeholder={placeholder} />
      <button type="button" onClick={() => setShown((s) => !s)} aria-label={shown ? "Hide password" : "Show password"}>
        {shown ? "Hide" : "Show"}
      </button>
    </div>
  );
}
