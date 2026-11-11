// In-memory mock database for the hackathon front end.
// Eradiri's real backend replaces this; the shapes match docs/API.md.
// Data lives on globalThis so it survives hot reloads, and resets when the dev server restarts.

import { createHash, randomUUID } from "node:crypto";
import { endDate, licencePriceKobo, makeLicenceNumber, splitPrice } from "../pricing";
import type { Duration, Licence, LicencePart, LicenceStatus, PaymentStatus, Platform, Poster, PublicCreator, SocialAccount, User, Video, VideoStatus } from "../types";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  businessName: string | null;
  avatarUrl: string | null;
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
  basePriceKobo: number;
}
export interface LicenceRow {
  id: string;
  licenceNumber: string;
  videoId: string;
  buyerId: string;
  part: LicencePart | null;
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

// Placeholder media: free Pexels clips and Unsplash portraits, loaded straight from their sites.
const face = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=faces&w=160&h=160&q=75`;
const still = (path: string) => `https://images.pexels.com/videos/${path}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
const clip = (path: string) => `https://videos.pexels.com/video-files/${path}`;

// Demo accounts. Password for all of them: demo1234
const SEED_USERS: Omit<UserRow, "passwordHash">[] = [
  { id: "u_tolu", name: "Tolu Adeyemi", email: "tolu@demo.ami", businessName: null, avatarUrl: face("photo-1768244017009-ae72704195cb"), isAdmin: false, verified: true, suspended: false, createdAt: iso(90 * DAY) },
  { id: "u_chinedu", name: "Chinedu Okafor", email: "chinedu@demo.ami", businessName: null, avatarUrl: face("photo-1586474714722-d1f9e551cf34"), isAdmin: false, verified: false, suspended: false, createdAt: iso(70 * DAY) },
  { id: "u_aisha", name: "Aisha Bello", email: "aisha@demo.ami", businessName: "Aisha's Kitchen", avatarUrl: face("photo-1680878790148-18c83f270499"), isAdmin: false, verified: false, suspended: false, createdAt: iso(60 * DAY) },
  { id: "u_kemi", name: "Kemi Johnson", email: "kemi@demo.ami", businessName: null, avatarUrl: face("photo-1677935711525-1059c0cb9b44"), isAdmin: false, verified: false, suspended: false, createdAt: iso(45 * DAY) },
  { id: "u_brand", name: "Ada Nwosu", email: "brand@demo.ami", businessName: "Zobo & Co.", avatarUrl: face("photo-1697383904932-94304530a3dd"), isAdmin: false, verified: false, suspended: false, createdAt: iso(20 * DAY) },
  { id: "u_blog", name: "Femi Lawal", email: "blog@demo.ami", businessName: "Gist Central", avatarUrl: face("photo-1522529599102-193c0d76b5b6"), isAdmin: false, verified: false, suspended: false, createdAt: iso(30 * DAY) },
  { id: "u_admin", name: "Àmì Admin", email: "admin@demo.ami", businessName: "Àmì", avatarUrl: null, isAdmin: true, verified: true, suspended: false, createdAt: iso(100 * DAY) },
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
  still: string;
  clip: string;
  durationSec: number; // matches the placeholder clip so "part of it" lines up with what plays
  daysAgo: number;
  priceNaira?: number;
  status?: VideoStatus;
};

const SEED_VIDEOS: SeedVideo[] = [
  { id: "v_nepa", creatorId: "u_tolu", title: "When the light comes back at 3am", description: "The whole street wakes up at once. Generator off, fans on, someone shouting 'Up NEPA!' from two compounds away.", category: "Comedy", tags: ["nepa", "light", "lagos", "man laughing", "night"], poster: P.ember, still: "8496469/adult-bald-black-model-business-8496469", clip: "8496469/8496469-sd_960_540_25fps.mp4", durationSec: 8, daysAgo: 3 },
  { id: "v_mum", creatorId: "u_tolu", title: "My mum when I say I'm not hungry", description: "Every Nigerian child knows this conversation. It ends with a full plate anyway.", category: "Comedy", tags: ["family", "food", "mum", "woman talking", "home"], poster: P.night, still: "7594690/access-adult-african-american-analyzing-7594690", clip: "7594690/7594690-sd_960_540_25fps.mp4", durationSec: 19, daysAgo: 12 },
  { id: "v_startup", creatorId: "u_tolu", title: "First day at a Lagos startup", description: "Standup at 9, 'quick sync' at 10, pizza at 7pm, and nobody has explained what the company does.", category: "Lifestyle", tags: ["work", "tech", "lagos", "office", "talking to camera"], poster: P.indigo, still: "4994033/pexels-photo-4994033", clip: "4994033/4994033-sd_960_540_25fps.mp4", durationSec: 8, daysAgo: 25 },
  { id: "v_exam", creatorId: "u_tolu", title: "Exam season in a Nigerian home", description: "TV off, data off, and somehow every relative has started calling to ask about your results.", category: "Comedy", tags: ["school", "family", "home"], poster: P.sky, still: "5664462/african-dancing-headphones-listening-5664462", clip: "5664462/5664462-sd_960_540_25fps.mp4", durationSec: 10, daysAgo: 40, status: "hidden" },
  { id: "v_danfo", creatorId: "u_chinedu", title: "Danfo conductor vs. ₦50 change", description: "A negotiation that has lasted three bus stops and is not close to ending.", category: "Comedy", tags: ["danfo", "bus", "conductor", "transport", "lagos", "man laughing"], poster: P.sand, still: "4994324/pexels-photo-4994324", clip: "4994324/4994324-sd_540_960_25fps.mp4", durationSec: 14, daysAgo: 5 },
  { id: "v_landlord", creatorId: "u_chinedu", title: "Landlord's 'small increase'", description: "He says it's small. The new rent says otherwise.", category: "Comedy", tags: ["rent", "landlord", "skit", "filming"], poster: P.palm, still: "8360259/pexels-photo-8360259", clip: "8360259/8360259-sd_960_506_25fps.mp4", durationSec: 14, daysAgo: 18 },
  { id: "v_pastor", creatorId: "u_chinedu", title: "POV: your driver is also a pastor", description: "You booked a ride. You got a sermon, a prayer and a request to sow a seed.", category: "Comedy", tags: ["ride", "driver", "church", "pastor", "man laughing"], poster: P.night, still: "4994037/pexels-photo-4994037", clip: "4994037/4994037-sd_960_540_25fps.mp4", durationSec: 16, daysAgo: 33 },
  { id: "v_jollof", creatorId: "u_aisha", title: "Jollof wars: Lagos vs. Accra", description: "Two pots, one kitchen, zero chance of agreement. Recipe for the winning pot in the caption.", category: "Food", tags: ["jollof", "rice", "recipe", "ghana", "cooking"], poster: P.ember, still: "10200319/pexels-photo-10200319", clip: "10200319/10200319-sd_540_960_25fps.mp4", durationSec: 10, daysAgo: 8, priceNaira: 4_000 },
  { id: "v_suya", creatorId: "u_aisha", title: "Suya at midnight", description: "Close-up grill sounds, yaji, onions and a very patient mallam. Made for food pages.", category: "Food", tags: ["suya", "grilled meat", "skewers", "street food", "night", "asmr"], poster: P.sand, still: "35610097/pexels-photo-35610097", clip: "35610097/15091195_540_960_24fps.mp4", durationSec: 18, daysAgo: 15 },
  { id: "v_puff", creatorId: "u_aisha", title: "Puff-puff in 10 minutes", description: "The fastest puff-puff method we've tested, start to finish in one take.", category: "Food", tags: ["snacks", "recipe", "eating"], poster: P.sand, still: "10200311/pexels-photo-10200311", clip: "10200311/10200311-sd_540_960_25fps.mp4", durationSec: 4, daysAgo: 50 },
  { id: "v_balogun", creatorId: "u_aisha", title: "How to bargain at Balogun market", description: "Start at a third of the price. Walk away once. Never show you like it.", category: "Lifestyle", tags: ["market", "shopping", "lagos", "trader", "selling food"], poster: P.palm, still: "27165163/abuja-market-african-market-bariga-market-business-woman-27165163", clip: "27165163/12087846_960_540_25fps.mp4", durationSec: 13, daysAgo: 22 },
  { id: "v_shoki", creatorId: "u_kemi", title: "Shoki footwork in 60 seconds", description: "Step-by-step footwork breakdown, filmed in one continuous shot.", category: "Dance", tags: ["dance", "dancing", "tutorial", "afrobeats", "women"], poster: P.indigo, still: "8956007/pexels-photo-8956007", clip: "8956007/8956007-sd_540_960_25fps.mp4", durationSec: 15, daysAgo: 6, priceNaira: 8_000 },
  { id: "v_owambe", creatorId: "u_kemi", title: "Owambe aunty seat negotiations", description: "The VIP table is full. The aunty disagrees.", category: "Owambe", tags: ["owambe", "party", "aunty", "wedding", "dancing", "aso oke"], poster: P.ember, still: "37964255/pexels-photo-37964255", clip: "37964255/16109125_540_960_24fps.mp4", durationSec: 28, daysAgo: 28 },
  { id: "v_mc", creatorId: "u_kemi", title: "The wedding MC who won't stop talking", description: "The couple has been standing for 14 minutes. He has one more announcement.", category: "Owambe", tags: ["wedding", "mc", "bride", "ceremony"], poster: P.sky, still: "38299946/pexels-photo-38299946", clip: "38299946/16262938_540_960_24fps.mp4", durationSec: 22, daysAgo: 37, priceNaira: 6_000, status: "under_review" },
];

type SeedLicence = { licenceNumber: string; videoId: string; buyerId: string; part: LicencePart | null; duration: Duration; startedDaysAgo: number };

const SEED_LICENCES: SeedLicence[] = [
  { licenceNumber: "AMI-7K3Q-92XD", videoId: "v_pastor", buyerId: "u_brand", part: { startSec: 4, endSec: 14 }, duration: "1m", startedDaysAgo: 0 },
  { licenceNumber: "AMI-EXP2-4R8M", videoId: "v_startup", buyerId: "u_blog", part: null, duration: "1m", startedDaysAgo: 45 },
  { licenceNumber: "AMI-H6WN-3TQA", videoId: "v_nepa", buyerId: "u_brand", part: { startSec: 2, endSec: 6 }, duration: "1m", startedDaysAgo: 2 },
  { licenceNumber: "AMI-9FZC-RM4P", videoId: "v_mum", buyerId: "u_blog", part: null, duration: "forever", startedDaysAgo: 4 },
  { licenceNumber: "AMI-B2LV-8YKD", videoId: "v_startup", buyerId: "u_kemi", part: null, duration: "3m", startedDaysAgo: 8 },
  { licenceNumber: "AMI-T5GE-6JUS", videoId: "v_nepa", buyerId: "u_chinedu", part: { startSec: 3, endSec: 8 }, duration: "1y", startedDaysAgo: 11 },
  { licenceNumber: "AMI-K8PR-5WXC", videoId: "v_mum", buyerId: "u_aisha", part: { startSec: 5, endSec: 15 }, duration: "1m", startedDaysAgo: 14 },
  { licenceNumber: "AMI-Q3ZD-7MHN", videoId: "v_nepa", buyerId: "u_brand", part: null, duration: "1m", startedDaysAgo: 20 },
  { licenceNumber: "AMI-R4TJ-2NVB", videoId: "v_jollof", buyerId: "u_tolu", part: null, duration: "1m", startedDaysAgo: 7 },
  { licenceNumber: "AMI-W9CE-6PLK", videoId: "v_danfo", buyerId: "u_blog", part: null, duration: "3m", startedDaysAgo: 3 },
  { licenceNumber: "AMI-Z2HQ-8FDS", videoId: "v_shoki", buyerId: "u_brand", part: { startSec: 0, endSec: 8 }, duration: "1m", startedDaysAgo: 5 },
];

function sha(seed: string) {
  return createHash("sha256").update(seed).digest("hex");
}

function seed(): Db {
  const db: Db = { users: [], social: [], videos: [], licences: [], payments: [] };
  for (const u of SEED_USERS) db.users.push({ ...u, passwordHash: hashPassword("demo1234") });
  SEED_SOCIAL.forEach((s, i) => db.social.push({ ...s, id: `s_${i}`, verified: false }));

  for (const v of SEED_VIDEOS) {
    db.videos.push({
      id: v.id,
      creatorId: v.creatorId,
      title: v.title,
      description: v.description,
      category: v.category,
      tags: v.tags,
      originalFileUrl: clip(v.clip),
      previewUrl: clip(v.clip),
      thumbnailUrl: still(v.still),
      poster: v.poster,
      durationSec: v.durationSec,
      fileSha256: sha(v.id),
      status: v.status ?? "live",
      createdAt: iso(v.daysAgo * DAY),
      basePriceKobo: (v.priceNaira ?? 5_000) * 100,
    });
  }

  SEED_LICENCES.forEach((l, i) => {
    const video = db.videos.find((v) => v.id === l.videoId)!;
    const priceKobo = licencePriceKobo(video.basePriceKobo, video.durationSec, l.part, l.duration);
    const { platformFeeKobo, creatorShareKobo } = splitPrice(priceKobo);
    const start = new Date(Date.now() - l.startedDaysAgo * DAY - 60 * 60 * 1000);
    const end = endDate(start, l.duration);
    const id = `l_seed_${i}`;
    db.licences.push({
      id,
      licenceNumber: l.licenceNumber,
      videoId: l.videoId,
      buyerId: l.buyerId,
      part: l.part,
      duration: l.duration,
      startsAt: start.toISOString(),
      endsAt: end?.toISOString() ?? null,
      priceKobo,
      platformFeeKobo,
      creatorShareKobo,
      status: "active",
      createdAt: start.toISOString(),
    });
    db.payments.push({ id: `p_seed_${i}`, licenceId: id, reference: `SBX-SEED-${i + 1001}`, amountKobo: priceKobo, status: "paid", paidAt: start.toISOString() });
  });

  return db;
}

const g = globalThis as unknown as { __amiDb?: Db };
export function db(): Db {
  if (!g.__amiDb || !("licences" in g.__amiDb) || g.__amiDb.videos.some((v) => (v as Partial<VideoRow>).basePriceKobo === undefined)) {
    g.__amiDb = seed(); // also replaces a store left over from the old licence model during hot reload
  }
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
  return { id: u.id, name: u.name, businessName: u.businessName, avatarUrl: u.avatarUrl, verified: u.verified, socialAccounts: socialOf(u.id) };
}

export function toVideo(v: VideoRow): Video {
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
    basePriceKobo: v.basePriceKobo,
  };
}

/** Active licences whose end date has passed are reported as expired. */
export function effectiveStatus(l: LicenceRow): LicenceStatus {
  if (l.status === "active" && l.endsAt && new Date(l.endsAt).getTime() < Date.now()) return "expired";
  return l.status;
}

export function videoSummary(v: VideoRow) {
  const creator = db().users.find((x) => x.id === v.creatorId)!;
  return { id: v.id, title: v.title, previewUrl: v.previewUrl, thumbnailUrl: v.thumbnailUrl, poster: v.poster, durationSec: v.durationSec, creatorName: creator.name };
}

export function toLicence(l: LicenceRow): Licence {
  const v = db().videos.find((x) => x.id === l.videoId)!;
  const buyer = db().users.find((x) => x.id === l.buyerId)!;
  return {
    id: l.id,
    licenceNumber: l.licenceNumber,
    video: videoSummary(v),
    buyer: { id: buyer.id, name: buyer.name, businessName: buyer.businessName },
    part: l.part,
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
