import Link from "next/link";

/** The Àmì mark from the pitch deck: a rounded square with a play triangle and a corner "mark". */
export function AmiMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="2.5" y="2.5" width="27" height="27" rx="7.5" stroke="var(--color-ember)" strokeWidth="3" />
      <path d="M13 10.5v11l9-5.5-9-5.5Z" fill="var(--color-ember)" />
      <path d="M21 25.5h4.5V21" stroke="var(--color-gold)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink" aria-label="Àmì home">
      <AmiMark />
      <span className="text-[22px] leading-none font-extrabold tracking-tight">Àmì</span>
    </Link>
  );
}
