// Shared data shapes for the Àmì front end and API.
// These mirror the data model in the build spec. The API speaks camelCase JSON;
// the backend can store snake_case columns. All money is in kobo (integers).

export type Platform = "instagram" | "tiktok" | "youtube" | "x";
export type LicencePlatform = Platform | "all";
export type UseType = "repost" | "social" | "advert";
export type Duration = "30d" | "90d" | "1y" | "lifetime";
export type VideoStatus = "live" | "hidden" | "under_review";
export type LicenceStatus = "pending" | "active" | "expired";
export type PaymentStatus = "initiated" | "paid" | "failed";
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
  verified: boolean;
  socialAccounts: SocialAccount[];
}

export interface VideoPrice {
  useType: UseType;
  basePriceKobo: number; // 30 days, one platform
  enabled: boolean;
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
  prices: VideoPrice[];
  fromPriceKobo: number | null; // cheapest enabled licence, null if none enabled
}

export interface LicenceVideoSummary {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  poster: Poster;
  creatorName: string;
}

export interface Licence {
  id: string;
  licenceNumber: string; // e.g. AMI-7K3Q-92XD
  video: LicenceVideoSummary;
  buyer: { id: string; name: string; businessName: string | null };
  useType: UseType;
  platform: LicencePlatform;
  coveredAccounts: string[]; // handles, e.g. ["@zoboandco"]
  duration: Duration;
  startsAt: string | null; // set when payment is confirmed
  endsAt: string | null; // null = lifetime (or not started)
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
    useType: UseType;
    platform: LicencePlatform;
    coveredAccounts: string[];
    startsAt: string | null;
    endsAt: string | null;
  } | null;
}

// ---- Request bodies ----

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  businessName?: string;
  socialAccounts?: { platform: Platform; handle: string }[];
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
  tags: string[];
  prices: VideoPrice[];
  declarations: { ownsVideo: boolean; hasRights: boolean };
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
  prices?: VideoPrice[];
}

export interface CheckoutInput {
  videoId: string;
  useType: UseType;
  platform: LicencePlatform;
  duration: Duration;
  coveredAccounts: string[];
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
  status: PaymentStatus;
  licence: Licence;
  video: Video;
}

export interface Sale {
  licenceNumber: string;
  videoId: string;
  videoTitle: string;
  buyerName: string;
  buyerBusinessName: string | null;
  useType: UseType;
  platform: LicencePlatform;
  coveredAccounts: string[];
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
