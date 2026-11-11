// Shared data shapes for the Àmì front end and API.
// The API speaks camelCase JSON; the backend can store snake_case columns. All money is in kobo (integers).
//
// Licence model: a buyer licenses either the whole video or a part of it (a time range),
// for 1 month, 3 months, 1 year or forever. Each video has one price set by its creator:
// the whole video for 1 month. Everything else is worked out from that (see lib/pricing.ts).

export type Platform = "instagram" | "tiktok" | "youtube" | "x";
export type Duration = "1m" | "3m" | "1y" | "forever";
export type VideoStatus = "live" | "hidden" | "under_review";
export type LicenceStatus = "pending" | "active" | "expired" | "cancelled";
export type PaymentStatus = "initiated" | "pending" | "paid" | "failed" | "partial" | "overpaid";
export type CheckStatus = "valid" | "expired" | "not_found";

export interface SocialAccount {
  id: string;
  platform: Platform;
  handle: string; // without the leading @
  verified: boolean; // always false in the hackathon build
}

export interface User {
  id: string;
  name: string;
  email: string;
  businessName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  verified: boolean;
  suspended: boolean;
  createdAt: string; // ISO date
  socialAccounts: SocialAccount[];
}

/** What other people can see about a creator. */
export interface PublicCreator {
  id: string;
  name: string;
  businessName: string | null;
  avatarUrl: string | null;
  verified: boolean;
  socialAccounts: SocialAccount[];
}

/** Colours for a generated poster when a video has no thumbnail image. */
export interface Poster {
  from: string;
  to: string;
}

export interface Video {
  id: string;
  creator: PublicCreator;
  title: string;
  description: string;
  category: string;
  tags: string[];
  previewUrl: string; // watermarked preview, public
  thumbnailUrl: string | null;
  poster: Poster;
  durationSec: number;
  fileSha256: string;
  status: VideoStatus;
  createdAt: string;
  basePriceKobo: number; // the creator's price: whole video, 1 month
}

/** A part of a video, in whole seconds. `null` on a licence means the whole video. */
export interface LicencePart {
  startSec: number;
  endSec: number;
}

export interface LicenceVideoSummary {
  id: string;
  title: string;
  previewUrl: string;
  thumbnailUrl: string | null;
  poster: Poster;
  durationSec: number;
  creatorName: string;
}

export interface Licence {
  id: string;
  licenceNumber: string; // e.g. AMI-7K3Q-92XD
  video: LicenceVideoSummary;
  buyer: { id: string; name: string; businessName: string | null };
  part: LicencePart | null;
  duration: Duration;
  startsAt: string | null; // set when payment is confirmed
  endsAt: string | null; // null = forever (or not started)
  priceKobo: number;
  platformFeeKobo: number;
  creatorShareKobo: number;
  status: LicenceStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  reference: string;
  licenceId: string;
  amountKobo: number;
  status: PaymentStatus;
  paidAt: string | null;
}

/** Public licence check result. Never includes prices or emails. */
export interface LicenceCheck {
  status: CheckStatus;
  licence: {
    licenceNumber: string;
    video: LicenceVideoSummary;
    creator: { name: string; verified: boolean };
    buyer: { name: string; businessName: string | null };
    part: LicencePart | null;
    duration: Duration;
    startsAt: string | null;
    endsAt: string | null;
  } | null;
}

// ---- Request bodies ----

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  businessName?: string | null;
  socialAccounts?: { platform: Platform; handle: string }[];
}

export interface CreateVideoInput {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  basePriceKobo: number;
  rightsConfirmed: boolean; // made the video and has the rights to everything in it
  fileName: string;
  fileSizeBytes: number;
  fileSha256: string;
  durationSec: number;
  thumbnailDataUrl: string | null; // mock only: real backend makes the thumbnail
}

export interface UpdateVideoInput {
  title?: string;
  description?: string;
  status?: Extract<VideoStatus, "live" | "hidden">;
  basePriceKobo?: number;
}

export interface CheckoutInput {
  videoId: string;
  part: LicencePart | null;
  duration: Duration;
}

export interface CheckoutResult {
  licenceNumber: string;
  paymentReference: string;
  amountKobo: number;
  paymentUrl: string; // where to send the buyer to pay
}

// ---- Response bodies ----

export interface PaymentSession {
  reference: string;
  amountKobo: number;
  paymentUrl: string | null; // the bank's hosted checkout (the mock API points at /pay/:reference)
  status: PaymentStatus;
  licence: Licence;
  video: Video;
}

export interface Sale {
  licenceNumber: string;
  videoId: string;
  videoTitle: string;
  videoThumbnailUrl: string | null;
  videoPoster: Poster;
  buyerName: string;
  buyerBusinessName: string | null;
  part: LicencePart | null;
  duration: Duration;
  startsAt: string | null;
  endsAt: string | null;
  creatorShareKobo: number;
  status: LicenceStatus;
}

export interface MyVideo extends Video {
  licencesSold: number;
  earningsKobo: number;
}

export interface Library {
  totals: {
    videos: number;
    licencesSold: number;
    earningsKobo: number;
    pendingPayoutKobo: number;
  };
  videos: MyVideo[];
  sales: Sale[];
  licences: Licence[];
}

export interface DownloadLink {
  url: string;
  expiresAt: string;
}

export interface AdminTransaction {
  reference: string;
  licenceNumber: string;
  videoTitle: string;
  buyerName: string;
  creatorName: string;
  amountKobo: number;
  platformFeeKobo: number;
  status: PaymentStatus;
  paidAt: string | null;
}

export interface AdminOverview {
  counts: {
    users: number;
    videos: number;
    licencesSold: number;
    totalValueKobo: number;
    feesKobo: number;
  };
  users: (User & { videoCount: number; licenceCount: number })[];
  videos: Video[];
  transactions: AdminTransaction[];
}

export interface ApiError {
  error: string;
}
