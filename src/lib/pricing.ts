import type { Duration, LicencePlatform, Platform, UseType, VideoPrice } from "./types";

// Placeholder prices and multipliers from the build spec. The pilot sets real ones.

export const PLATFORM_FEE_RATE = 0.15;

export const USE_TYPES: {
  value: UseType;
  label: string;
  forWho: string;
  allows: string;
  suggestedKobo: number;
}[] = [
  {
    value: "repost",
    label: "Repost",
    forWho: "Blogs and pages",
    allows: "Post as-is, with credit to the creator",
    suggestedKobo: 10_000_00,
  },
  {
    value: "social",
    label: "Social",
    forWho: "Brands' own pages",
    allows: "Post, edit, add branding. No paid promotion",
    suggestedKobo: 50_000_00,
  },
  {
    value: "advert",
    label: "Advert",
    forWho: "Paid campaigns",
    allows: "Everything in Social, plus paid promotion",
    suggestedKobo: 150_000_00,
  },
];

export const DURATIONS: { value: Duration; label: string; multiplier: number; days: number | null }[] = [
  { value: "30d", label: "30 days", multiplier: 1, days: 30 },
  { value: "90d", label: "90 days", multiplier: 2, days: 90 },
  { value: "1y", label: "1 year", multiplier: 5, days: 365 },
  { value: "lifetime", label: "Lifetime", multiplier: 10, days: null },
];

export const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X" },
];

export const LICENCE_PLATFORMS: { value: LicencePlatform; label: string; multiplier: number }[] = [
  ...PLATFORMS.map((p) => ({ ...p, multiplier: 1 })),
  { value: "all", label: "All platforms", multiplier: 2 },
];

export const CATEGORIES = ["Comedy", "Drama", "Music", "Dance", "Food", "Lifestyle", "Tech"] as const;

export function labelForUseType(u: UseType) {
  return USE_TYPES.find((x) => x.value === u)?.label ?? u;
}
export function durationLabel(d: Duration) {
  return DURATIONS.find((x) => x.value === d)?.label ?? d;
}
export function platformLabel(p: LicencePlatform) {
  return LICENCE_PLATFORMS.find((x) => x.value === p)?.label ?? p;
}

export function suggestedPrices(): VideoPrice[] {
  return USE_TYPES.map((u) => ({ useType: u.value, basePriceKobo: u.suggestedKobo, enabled: true }));
}

/** Price of a licence in kobo: base × duration multiplier × platform multiplier. */
export function licencePriceKobo(baseKobo: number, duration: Duration, platform: LicencePlatform) {
  const d = DURATIONS.find((x) => x.value === duration)?.multiplier ?? 1;
  const p = platform === "all" ? 2 : 1;
  return Math.round(baseKobo * d * p);
}

/** Splits a price into Àmì's fee and the creator's share. Both whole kobo. */
export function splitPrice(priceKobo: number) {
  const platformFeeKobo = Math.round(priceKobo * PLATFORM_FEE_RATE);
  return { platformFeeKobo, creatorShareKobo: priceKobo - platformFeeKobo };
}

export function endDate(start: Date, duration: Duration): Date | null {
  const days = DURATIONS.find((x) => x.value === duration)?.days;
  if (days == null) return null;
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
}

export function fromPriceKobo(prices: VideoPrice[]): number | null {
  const enabled = prices.filter((p) => p.enabled).map((p) => p.basePriceKobo);
  return enabled.length ? Math.min(...enabled) : null;
}

// Readable licence numbers: no 0/O or 1/I so people can type them.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export function makeLicenceNumber(random: () => number = Math.random) {
  const block = () => Array.from({ length: 4 }, () => ALPHABET[Math.floor(random() * ALPHABET.length)]).join("");
  return `AMI-${block()}-${block()}`;
}

export function normaliseLicenceNumber(input: string) {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = raw.startsWith("AMI") ? raw.slice(3) : raw;
  if (body.length !== 8) return input.trim().toUpperCase();
  return `AMI-${body.slice(0, 4)}-${body.slice(4)}`;
}
