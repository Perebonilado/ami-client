// In-memory mock database for the hackathon front end.
// Eradiri's real backend replaces this; the shapes match docs/API.md.
// Data lives on globalThis so it survives hot reloads, and resets when the dev server restarts.

import { createHash, randomUUID } from "node:crypto";
import { endDate, fromPriceKobo, licencePriceKobo, makeLicenceNumber, splitPrice } from "../pricing";
import type {
  Duration,
  Licence,
  LicencePlatform,
  LicenceStatus,
  PaymentStatus,
  Platform,
  Poster,
  PublicCreator,
  SocialAccount,
  UseType,
  User,
  Video,
  VideoPrice,
  VideoStatus,
} from "../types";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  businessName: string | null;
  isAdmin: boolean;
  verified: boolean;
  suspended: boolean;
  createdAt: string;
}
export interface SocialRow {
  id: string;
  userId: string;
  platform: Platform;
  handle: string;
  verified: boolean;
}
export interface VideoRow {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  originalFileUrl: string;
  previewUrl: string;
  thumbnailUrl: string | null;
  poster: Poster;
  durationSec: number;
  fileSha256: string;
  status: VideoStatus;
  createdAt: string;
}
export interface PriceRow extends VideoPrice {
  videoId: string;
}
export interface LicenceRow {
  id: string;
  licenceNumber: string;
  videoId: string;
  buyerId: string;
  useType: UseType;
  platform: LicencePlatform;
  coveredAccounts: string[];
  duration: Duration;
  startsAt: string | null;
  endsAt: string | null;
  priceKobo: number;
  platformFeeKobo: number;
  creatorShareKobo: number;
  status: LicenceStatus;
  createdAt: string;
}
export interface PaymentRow {
  id: string;
  licenceId: string;
  reference: string;
  amountKobo: number;
  status: PaymentStatus;
  paidAt: string | null;
}

export interface Db {
  users: UserRow[];
  social: SocialRow[];
  videos: VideoRow[];
  prices: PriceRow[];
  licences: LicenceRow[];
  payments: PaymentRow[];
}

export function hashPassword(pw: string) {
  return createHash("sha256").update(`ami:${pw}`).digest("hex");
}
export function newId(prefix: string) {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}

// ---------- Seed ----------

const DAY = 24 * 60 * 60 * 1000;
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

// Demo accounts. Password for all of them: demo1234
const SEED_USERS: Omit<UserRow, "passwordHash">[] = [
  { id: "u_tolu", name: "Tolu Adeyemi", email: "tolu@demo.ami", businessName: null, isAdmin: false, verified: true, suspended: false, createdAt: iso(90 * DAY) },
  { id: "u_chinedu", name: "Chinedu Okafor", email: "chinedu@demo.ami", businessName: null, isAdmin: false, verified: false, suspended: false, createdAt: iso(70 * DAY) },
  { id: "u_aisha", name: "Aisha Bello", email: "aisha@demo.ami", businessName: "Aisha's Kitchen", isAdmin: false, verified: false, suspended: false, createdAt: iso(60 * DAY) },
  { id: "u_kemi", name: "Kemi Johnson", email: "kemi@demo.ami", businessName: null, isAdmin: false, verified: false, suspended: false, createdAt: iso(45 * DAY) },
  { id: "u_brand", name: "Ada Nwosu", email: "brand@demo.ami", businessName: "Zobo & Co.", isAdmin: false, verified: false, suspended: false, createdAt: iso(20 * DAY) },
  { id: "u_blog", name: "Femi Lawal", email: "blog@demo.ami", businessName: "Gist Central", isAdmin: false, verified: false, suspended: false, createdAt: iso(30 * DAY) },
  { id: "u_admin", name: "Àmì Admin", email: "admin@demo.ami", businessName: "Àmì", isAdmin: true, verified: true, suspended: false, createdAt: iso(100 * DAY) },
];

const SEED_SOCIAL: Omit<SocialRow, "id" | "verified">[] = [
  { userId: "u_tolu", platform: "instagram", handle: "tolu.makes.skits" },
  { userId: "u_tolu", platform: "tiktok", handle: "toluskits" },
  { userId: "u_chinedu", platform: "instagram", handle: "chinedu.comedy" },
  { userId: "u_chinedu", platform: "youtube", handle: "ChineduComedyTV" },
  { userId: "u_aisha", platform: "instagram", handle: "aishas.kitchen" },
  { userId: "u_aisha", platform: "tiktok", handle: "aishacooks" },
  { userId: "u_kemi", platform: "tiktok", handle: "kemi.moves" },
  { userId: "u_brand", platform: "instagram", handle: "zoboandco" },
  { userId: "u_brand", platform: "tiktok", handle: "zoboandco" },
  { userId: "u_blog", platform: "instagram", handle: "gistcentral.ng" },
  { userId: "u_blog", platform: "x", handle: "GistCentralNG" },
];

const P = {
  ember: { from: "#E2552D", to: "#F2C14E" },
  night: { from: "#1A141F", to: "#5B3A6E" },
  palm: { from: "#1F5E45", to: "#C9D66B" },
  indigo: { from: "#2E2A7A", to: "#E2552D" },
  sand: { from: "#C7834E", to: "#F5E6D3" },
  sky: { from: "#1D4E89", to: "#7FC8F8" },
};

type SeedVideo = {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  poster: Poster;
  durationSec: number;
  daysAgo: number;
  prices?: [number, number, number]; // naira, 0 = disabled
  status?: VideoStatus;
};

const SEED_VIDEOS: SeedVideo[] = [
  { id: "v_nepa", creatorId: "u_tolu", title: "When the light comes back at 3am", description: "The whole street wakes up at once. Generator off, fans on, someone shouting 'Up NEPA!' from two compounds away.", category: "Comedy", tags: ["nepa", "light", "lagos"], poster: P.ember, durationSec: 58, daysAgo: 3 },
  { id: "v_mum", creatorId: "u_tolu", title: "My mum when I say I'm not hungry", description: "Every Nigerian child knows this conversation. It ends with a full plate anyway.", category: "Comedy", tags: ["family", "food", "mum"], poster: P.night, durationSec: 42, daysAgo: 12 },
  { id: "v_startup", creatorId: "u_tolu", title: "First day at a Lagos startup", description: "Standup at 9, 'quick sync' at 10, pizza at 7pm, and nobody has explained what the company does.", category: "Comedy", tags: ["work", "tech", "lagos"], poster: P.indigo, durationSec: 74, daysAgo: 25 },
  { id: "v_exam", creatorId: "u_tolu", title: "Exam season in a Nigerian home", description: "TV off, data off, and somehow every relative has started calling to ask about your results.", category: "Drama", tags: ["school", "family"], poster: P.sky, durationSec: 96, daysAgo: 40, prices: [15_000, 60_000, 0] },
  { id: "v_danfo", creatorId: "u_chinedu", title: "Danfo conductor vs. ₦50 change", description: "A negotiation that has lasted three bus stops and is not close to ending.", category: "Comedy", tags: ["danfo", "transport", "lagos"], poster: P.sand, durationSec: 63, daysAgo: 5 },
  { id: "v_landlord", creatorId: "u_chinedu", title: "Landlord's 'small increase'", description: "He says it's small. The new rent says otherwise.", category: "Comedy", tags: ["rent", "landlord"], poster: P.palm, durationSec: 51, daysAgo: 18 },
  { id: "v_pastor", creatorId: "u_chinedu", title: "POV: your driver is also a pastor", description: "You booked a ride. You got a sermon, a prayer and a request to sow a seed.", category: "Comedy", tags: ["ride", "church"], poster: P.night, durationSec: 88, daysAgo: 33 },
  { id: "v_jollof", creatorId: "u_aisha", title: "Jollof wars: Lagos vs. Accra", description: "Two pots, one kitchen, zero chance of agreement. Recipe for the winning pot in the caption.", category: "Food", tags: ["jollof", "recipe", "ghana"], poster: P.ember, durationSec: 120, daysAgo: 8, prices: [10_000, 40_000, 120_000] },
  { id: "v_suya", creatorId: "u_aisha", title: "Suya at midnight", description: "Close-up grill sounds, yaji, onions and a very patient mallam. Made for food pages.", category: "Food", tags: ["suya", "asmr", "street food"], poster: P.sand, durationSec: 47, daysAgo: 15 },
  { id: "v_puff", creatorId: "u_aisha", title: "Puff-puff in 10 minutes", description: "The fastest puff-puff method we've tested, start to finish in one take.", category: "Food", tags: ["snacks", "recipe"], poster: P.sand, durationSec: 105, daysAgo: 50 },
  { id: "v_balogun", creatorId: "u_aisha", title: "How to bargain at Balogun market", description: "Start at a third of the price. Walk away once. Never show you like it.", category: "Lifestyle", tags: ["market", "shopping", "lagos"], poster: P.palm, durationSec: 82, daysAgo: 22 },
  { id: "v_shoki", creatorId: "u_kemi", title: "Shoki footwork in 60 seconds", description: "Step-by-step footwork breakdown, filmed in one continuous shot.", category: "Dance", tags: ["dance", "tutorial", "afrobeats"], poster: P.indigo, durationSec: 60, daysAgo: 6, prices: [20_000, 80_000, 200_000] },
  { id: "v_owambe", creatorId: "u_kemi", title: "Owambe aunty seat negotiations", description: "The VIP table is full. The aunty disagrees.", category: "Comedy", tags: ["owambe", "party", "aunty"], poster: P.ember, durationSec: 55, daysAgo: 28 },
  { id: "v_mc", creatorId: "u_kemi", title: "The wedding MC who won't stop talking", description: "The couple has been standing for 14 minutes. He has one more announcement.", category: "Comedy", tags: ["wedding", "mc"], poster: P.sky, durationSec: 69, daysAgo: 37, status: "under_review" },
];

type SeedLicence = {
  licenceNumber: string;
  videoId: string;
  buyerId: string;
  useType: UseType;
  platform: LicencePlatform;
  coveredAccounts: string[];
  duration: Duration;
  startedDaysAgo: number;
};

const SEED_LICENCES: SeedLicence[] = [
  { licenceNumber: "AMI-7K3Q-92XD", videoId: "v_mum", buyerId: "u_brand", useType: "social", platform: "instagram", coveredAccounts: ["@zoboandco"], duration: "30d", startedDaysAgo: 4 },
  { licenceNumber: "AMI-EXP2-4R8M", videoId: "v_startup", buyerId: "u_blog", useType: "repost", platform: "instagram", coveredAccounts: ["@gistcentral.ng"], duration: "30d", startedDaysAgo: 45 },
  { licenceNumber: "AMI-H6WN-3TQA", videoId: "v_nepa", buyerId: "u_blog", useType: "repost", platform: "all", coveredAccounts: ["@gistcentral.ng", "@GistCentralNG"], duration: "90d", startedDaysAgo: 2 },
  { licenceNumber: "AMI-9FZC-RM4P", videoId: "v_jollof", buyerId: "u_brand", useType: "advert", platform: "instagram", coveredAccounts: ["@zoboandco"], duration: "30d", startedDaysAgo: 6 },
  { licenceNumber: "AMI-B2LV-8YKD", videoId: "v_danfo", buyerId: "u_blog", useType: "repost", platform: "x", coveredAccounts: ["@GistCentralNG"], duration: "1y", startedDaysAgo: 3 },
  { licenceNumber: "AMI-T5GE-6JUS", videoId: "v_exam", buyerId: "u_brand", useType: "social", platform: "tiktok", coveredAccounts: ["@zoboandco"], duration: "90d", startedDaysAgo: 20 },
];

function sha(seed: string) {
  return createHash("sha256").update(seed).digest("hex");
}

function seed(): Db {
  const db: Db = { users: [], social: [], videos: [], prices: [], licences: [], payments: [] };
  for (const u of SEED_USERS) db.users.push({ ...u, passwordHash: hashPassword("demo1234") });
  SEED_SOCIAL.forEach((s, i) => db.social.push({ ...s, id: `s_${i}`, verified: false }));

  SEED_VIDEOS.forEach((v, i) => {
    const sample = `/samples/sample-${(i % 3) + 1}.mp4`;
    db.videos.push({
      id: v.id,
      creatorId: v.creatorId,
      title: v.title,
      description: v.description,
      category: v.category,
      tags: v.tags,
      originalFileUrl: sample,
      previewUrl: sample,
      thumbnailUrl: null,
      poster: v.poster,
      durationSec: v.durationSec,
      fileSha256: sha(v.id),
      status: v.status ?? "live",
      createdAt: iso(v.daysAgo * DAY),
    });
    const [repost, social, advert] = v.prices ?? [10_000, 50_000, 150_000];
    const set: [UseType, number][] = [
      ["repost", repost],
      ["social", social],
      ["advert", advert],
    ];
    for (const [useType, naira] of set) {
      db.prices.push({ videoId: v.id, useType, basePriceKobo: (naira || 150_000) * 100, enabled: naira > 0 });
    }
  });

  SEED_LICENCES.forEach((l, i) => {
    const base = db.prices.find((p) => p.videoId === l.videoId && p.useType === l.useType)!.basePriceKobo;
    const priceKobo = licencePriceKobo(base, l.duration, l.platform);
    const { platformFeeKobo, creatorShareKobo } = splitPrice(priceKobo);
    const start = new Date(Date.now() - l.startedDaysAgo * DAY);
    const end = endDate(start, l.duration);
    const id = `l_seed_${i}`;
    db.licences.push({
      id,
      licenceNumber: l.licenceNumber,
      videoId: l.videoId,
      buyerId: l.buyerId,
      useType: l.useType,
      platform: l.platform,
      coveredAccounts: l.coveredAccounts,
      duration: l.duration,
      startsAt: start.toISOString(),
      endsAt: end?.toISOString() ?? null,
      priceKobo,
      platformFeeKobo,
      creatorShareKobo,
      status: "active",
      createdAt: start.toISOString(),
    });
    db.payments.push({
      id: `p_seed_${i}`,
      licenceId: id,
      reference: `SBX-SEED-${i + 1001}`,
      amountKobo: priceKobo,
      status: "paid",
      paidAt: start.toISOString(),
    });
  });

  return db;
}

const g = globalThis as unknown as { __amiDb?: Db };
export function db(): Db {
  if (!g.__amiDb) g.__amiDb = seed();
  return g.__amiDb;
}
export function resetDb() {
  g.__amiDb = seed();
}

// ---------- Serialisers ----------

export function socialOf(userId: string): SocialAccount[] {
  return db()
    .social.filter((s) => s.userId === userId)
    .map(({ id, platform, handle, verified }) => ({ id, platform, handle, verified }));
}

export function toUser(u: UserRow): User {
  const { passwordHash: _omit, ...rest } = u;
  void _omit;
  return { ...rest, socialAccounts: socialOf(u.id) };
}

export function toCreator(userId: string): PublicCreator {
  const u = db().users.find((x) => x.id === userId)!;
  return { id: u.id, name: u.name, businessName: u.businessName, verified: u.verified, socialAccounts: socialOf(u.id) };
}

export function pricesOf(videoId: string): VideoPrice[] {
  const order: UseType[] = ["repost", "social", "advert"];
  return db()
    .prices.filter((p) => p.videoId === videoId)
    .sort((a, b) => order.indexOf(a.useType) - order.indexOf(b.useType))
    .map(({ useType, basePriceKobo, enabled }) => ({ useType, basePriceKobo, enabled }));
}

export function toVideo(v: VideoRow): Video {
  const prices = pricesOf(v.id);
  return {
    id: v.id,
    creator: toCreator(v.creatorId),
    title: v.title,
    description: v.description,
    category: v.category,
    tags: v.tags,
    previewUrl: v.previewUrl,
    thumbnailUrl: v.thumbnailUrl,
    poster: v.poster,
    durationSec: v.durationSec,
    fileSha256: v.fileSha256,
    status: v.status,
    createdAt: v.createdAt,
    prices,
    fromPriceKobo: fromPriceKobo(prices),
  };
}

/** Active licences whose end date has passed are reported as expired. */
export function effectiveStatus(l: LicenceRow): LicenceStatus {
  if (l.status === "active" && l.endsAt && new Date(l.endsAt).getTime() < Date.now()) return "expired";
  return l.status;
}

export function toLicence(l: LicenceRow): Licence {
  const v = db().videos.find((x) => x.id === l.videoId)!;
  const creator = db().users.find((x) => x.id === v.creatorId)!;
  const buyer = db().users.find((x) => x.id === l.buyerId)!;
  return {
    id: l.id,
    licenceNumber: l.licenceNumber,
    video: { id: v.id, title: v.title, thumbnailUrl: v.thumbnailUrl, poster: v.poster, creatorName: creator.name },
    buyer: { id: buyer.id, name: buyer.name, businessName: buyer.businessName },
    useType: l.useType,
    platform: l.platform,
    coveredAccounts: l.coveredAccounts,
    duration: l.duration,
    startsAt: l.startsAt,
    endsAt: l.endsAt,
    priceKobo: l.priceKobo,
    platformFeeKobo: l.platformFeeKobo,
    creatorShareKobo: l.creatorShareKobo,
    status: effectiveStatus(l),
    createdAt: l.createdAt,
  };
}

export function uniqueLicenceNumber() {
  let n = makeLicenceNumber();
  while (db().licences.some((l) => l.licenceNumber === n)) n = makeLicenceNumber();
  return n;
}
