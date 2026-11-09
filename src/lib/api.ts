// Typed client for the Àmì API. Every screen talks to the backend through here.
// Point NEXT_PUBLIC_API_URL at Eradiri's backend to swap out the mock routes in src/app/api.
import type {
  AdminOverview,
  CheckoutInput,
  CheckoutResult,
  CreateVideoInput,
  DownloadLink,
  Library,
  Licence,
  LicenceCheck,
  LoginInput,
  PaymentSession,
  PaymentStatus,
  SignupInput,
  UpdateProfileInput,
  UpdateVideoInput,
  User,
  Video,
  VideoStatus,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as { error?: string }).error ?? "Something went wrong. Try again.", res.status);
  return data as T;
}

const post = <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
const patch = <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) });

export const api = {
  // Auth
  signup: (input: SignupInput) => post<{ user: User }>("/auth/signup", input),
  login: (input: LoginInput) => post<{ user: User }>("/auth/login", input),
  logout: () => post<{ ok: true }>("/auth/logout"),
  me: () => request<{ user: User | null }>("/me"),
  updateProfile: (input: UpdateProfileInput) => patch<{ user: User }>("/me", input),

  // Videos
  listVideos: (params: { q?: string; category?: string } = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
    return request<{ videos: Video[] }>(`/videos${qs ? `?${qs}` : ""}`);
  },
  getVideo: (id: string) => request<{ video: Video }>(`/videos/${id}`),
  createVideo: (input: CreateVideoInput) => post<{ video: Video }>("/videos", input),
  updateVideo: (id: string, input: UpdateVideoInput) => patch<{ video: Video }>(`/videos/${id}`, input),

  // Licensing and payment
  checkout: (input: CheckoutInput) => post<CheckoutResult>("/checkout", input),
  getPayment: (reference: string) => request<PaymentSession>(`/payments/${reference}`),
  simulatePayment: (reference: string, outcome: "paid" | "failed") =>
    post<{ status: PaymentStatus; licence: Licence }>(`/payments/${reference}/simulate`, { outcome }),
  getLicence: (number: string) => request<{ licence: Licence }>(`/licences/${encodeURIComponent(number)}`),
  downloadLink: (number: string) => request<DownloadLink>(`/licences/${encodeURIComponent(number)}/download`),
  checkLicence: (number: string) => request<LicenceCheck>(`/check/${encodeURIComponent(number)}`),

  // Library
  library: () => request<Library>("/library"),

  // Admin
  admin: () => request<AdminOverview>("/admin"),
  adminUpdateUser: (id: string, input: { suspended?: boolean; verified?: boolean }) => patch<{ user: User }>(`/admin/users/${id}`, input),
  adminUpdateVideo: (id: string, status: VideoStatus) => patch<{ video: Video }>(`/admin/videos/${id}`, { status }),
};
