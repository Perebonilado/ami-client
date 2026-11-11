import Link from "next/link";

/** The Àmì wordmark: the two accents of the name are drawn as blue marks. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`logo ${className}`} aria-label="Àmì" role="img">
      <span className="m m-a" aria-hidden>
        A
      </span>
      <span aria-hidden>m</span>
      <span className="m m-i" aria-hidden>
        ı
      </span>
    </span>
  );
}

export function Logo({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`logo ${className}`} aria-label="Àmì home">
      <span className="m m-a" aria-hidden>
        A
      </span>
      <span aria-hidden>m</span>
      <span className="m m-i" aria-hidden>
        ı
      </span>
    </Link>
  );
}
