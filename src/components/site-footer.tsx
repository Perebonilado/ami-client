import Link from "next/link";
import { AmiMark } from "./logo";

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <AmiMark size={22} />
          <span>Àmì · your work, your mark, your money.</span>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
          <Link href="/browse" className="hover:text-ink">Browse</Link>
          <Link href="/check" className="hover:text-ink">Check a licence</Link>
          <Link href="/upload" className="hover:text-ink">Upload a video</Link>
          <span>Access Youth Tech Forge 2026</span>
        </nav>
      </div>
    </footer>
  );
}
