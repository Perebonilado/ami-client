import { CookingPot, LayoutGrid, Laugh, Music, PartyPopper, ShoppingBag, type LucideIcon } from "lucide-react";

/** Filled blue badge with a white tick, shown next to verified creators. */
export function VerifiedTick({ className = "tick" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="Verified creator">
      <path
        d="M12 2.5 14.6 4.3l3.1-.1 1 3 2.6 1.8-1 3 1 3-2.6 1.8-1 3-3.1-.1L12 21.5l-2.6-1.8-3.1.1-1-3-2.6-1.8 1-3-1-3 2.6-1.8 1-3 3.1.1Z"
        fill="currentColor"
      />
      <path d="m8.5 12 2.3 2.3 4.7-4.7" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Line icons for each category (Browse rail, Upload picker). */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  All: LayoutGrid,
  Comedy: Laugh,
  Food: CookingPot,
  Dance: Music,
  Owambe: PartyPopper,
  Lifestyle: ShoppingBag,
};
