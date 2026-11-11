// Every call to the Àmì API goes through this RTK Query slice. Components use the generated hooks.
// In the sandbox, /api is proxied to the NestJS server (API_PROXY_URL in next.config.ts); locally it hits the mock routes.
import { type BaseQueryFn, createApi, type FetchArgs, fetchBaseQuery, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { withFixedRandom } from "./fixed-random";
import { signedIn } from "./session";
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
} from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

const rawBaseQuery = fetchBaseQuery({ baseUrl: BASE, credentials: "include" });

/** A 401 means the session has gone (expired, revoked or a server restart): mark the user as logged out. */
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);
  if (result.error?.status === 401 && api.endpoint !== "login" && api.endpoint !== "me") {
    api.dispatch(amiApi.util.upsertQueryData("me", undefined, { user: null }));
  }
  return result;
};

/** Data that belongs to whoever is logged in; refreshed when the account changes. */
const USER_TAGS = ["Library", "Licence", "Payment", "Admin"] as const;

export const amiApi = withFixedRandom(() =>
  createApi({
  reducerPath: "amiApi",
  baseQuery,
  tagTypes: ["Me", "Videos", "Video", "Library", "Licence", "Payment", "Check", "Admin"],
  endpoints: (build) => ({
    // Auth
    me: build.query<{ user: User | null }, void>({
      query: () => "/me",
      providesTags: ["Me"],
    }),
    login: build.mutation<{ user: User }, LoginInput>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: [...USER_TAGS],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(signedIn());
        dispatch(amiApi.util.upsertQueryData("me", undefined, { user: data.user }));
      },
    }),
    signup: build.mutation<{ user: User }, SignupInput>({
      query: (body) => ({ url: "/auth/signup", method: "POST", body }),
      invalidatesTags: [...USER_TAGS],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(signedIn());
        dispatch(amiApi.util.upsertQueryData("me", undefined, { user: data.user }));
      },
    }),
    logout: build.mutation<{ ok: true }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch(() => {});
        dispatch(amiApi.util.resetApiState());
        dispatch(amiApi.util.upsertQueryData("me", undefined, { user: null }));
      },
    }),
    updateProfile: build.mutation<{ user: User }, UpdateProfileInput>({
      query: (body) => ({ url: "/me", method: "PATCH", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(amiApi.util.upsertQueryData("me", undefined, { user: data.user }));
      },
    }),

    // Videos
    listVideos: build.query<{ videos: Video[] }, { q?: string; category?: string }>({
      query: ({ q, category }) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (category) params.set("category", category);
        const qs = params.toString();
        return `/videos${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Videos"],
    }),
    getVideo: build.query<{ video: Video }, string>({
      query: (id) => `/videos/${encodeURIComponent(id)}`,
      providesTags: (_r, _e, id) => [{ type: "Video", id }],
    }),
    createVideo: build.mutation<{ video: Video }, CreateVideoInput>({
      query: (body) => ({ url: "/videos", method: "POST", body }),
      invalidatesTags: ["Videos", "Library"],
    }),
    updateVideo: build.mutation<{ video: Video }, { id: string } & UpdateVideoInput>({
      query: ({ id, ...body }) => ({ url: `/videos/${encodeURIComponent(id)}`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Video", id }, "Videos", "Library"],
    }),

    // Licensing and payment
    checkout: build.mutation<CheckoutResult, CheckoutInput>({
      query: (body) => ({ url: "/checkout", method: "POST", body }),
    }),
    getPayment: build.query<PaymentSession, string>({
      query: (reference) => `/payments/${encodeURIComponent(reference)}`,
      providesTags: (_r, _e, reference) => [{ type: "Payment", id: reference }],
    }),
    confirmPayment: build.mutation<PaymentSession, string>({
      query: (reference) => ({ url: `/payments/${encodeURIComponent(reference)}/confirm`, method: "POST" }),
      invalidatesTags: ["Library", "Licence", "Check"],
    }),
    simulatePayment: build.mutation<{ status: PaymentStatus; licence: Licence }, { reference: string; outcome: "paid" | "failed" }>({
      query: ({ reference, outcome }) => ({ url: `/payments/${encodeURIComponent(reference)}/simulate`, method: "POST", body: { outcome } }),
      invalidatesTags: ["Library", "Licence", "Check"],
    }),
    getLicence: build.query<{ licence: Licence }, string>({
      query: (number) => `/licences/${encodeURIComponent(number)}`,
      providesTags: (_r, _e, number) => [{ type: "Licence", id: number }],
    }),
    // Signed links expire quickly, so never reuse one from the cache
    downloadLink: build.query<DownloadLink, string>({
      query: (number) => `/licences/${encodeURIComponent(number)}/download`,
      keepUnusedDataFor: 0,
    }),
    checkLicence: build.query<LicenceCheck, string>({
      query: (number) => `/check/${encodeURIComponent(number)}`,
      providesTags: (_r, _e, number) => [{ type: "Check", id: number }],
    }),

    // Library
    library: build.query<Library, void>({
      query: () => "/library",
      providesTags: ["Library"],
    }),

    // Admin
    admin: build.query<AdminOverview, void>({
      query: () => "/admin",
      providesTags: ["Admin"],
    }),
    adminUpdateUser: build.mutation<{ user: User }, { id: string; suspended?: boolean; verified?: boolean }>({
      query: ({ id, ...body }) => ({ url: `/admin/users/${encodeURIComponent(id)}`, method: "PATCH", body }),
      invalidatesTags: ["Admin", "Videos", "Video", "Me"],
    }),
    adminUpdateVideo: build.mutation<{ video: Video }, { id: string; status: VideoStatus }>({
      query: ({ id, status }) => ({ url: `/admin/videos/${encodeURIComponent(id)}`, method: "PATCH", body: { status } }),
      invalidatesTags: (_r, _e, { id }) => ["Admin", "Videos", { type: "Video", id }],
    }),
  }),
  }),
);

export const {
  useMeQuery,
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useListVideosQuery,
  useGetVideoQuery,
  useCreateVideoMutation,
  useUpdateVideoMutation,
  useCheckoutMutation,
  useGetPaymentQuery,
  useConfirmPaymentMutation,
  useSimulatePaymentMutation,
  useGetLicenceQuery,
  useLazyDownloadLinkQuery,
  useCheckLicenceQuery,
  useLibraryQuery,
  useAdminQuery,
  useAdminUpdateUserMutation,
  useAdminUpdateVideoMutation,
} = amiApi;

/**
 * A sentence the UI can show for any RTK Query error. Accepts the mock API's `{ error: "…" }` and the
 * NestJS backend's `{ error: { code, message } }`.
 */
export function errorMessage(error: unknown, fallback = "Something went wrong. Try again.") {
  if (error && typeof error === "object") {
    const e = error as { status?: unknown; data?: unknown; message?: unknown };
    const body = (e.data as { error?: unknown } | undefined)?.error;
    if (typeof body === "string") return body;
    if (body && typeof body === "object" && typeof (body as { message?: unknown }).message === "string") return (body as { message: string }).message;
    if (e.status === "FETCH_ERROR") return "We couldn’t reach Àmì. Check your connection and try again.";
    if (typeof e.message === "string" && e.message) return e.message;
  }
  return fallback;
}
