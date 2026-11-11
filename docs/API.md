# Àmì API contract

The front end talks to the backend only through the RTK Query slice in `src/store/api.ts` (Redux Toolkit also holds the app state). Today those calls hit mock route handlers in `src/app/api/**` (in-memory data, seeded from `src/lib/mock/db.ts`). To use the NestJS server (`ami-server`), build with `API_PROXY_URL` set to its address (for example `http://api` in the sandbox or `http://localhost:4000` locally): every `/api` request is then proxied to it, so the browser stays on one origin and the session cookie works. Pointing `NEXT_PUBLIC_API_URL` at another origin is not supported, because the cookie would not be sent.

Exact request and response types live in [`src/lib/types.ts`](../src/lib/types.ts). This page is the summary.

## Conventions

- JSON in, JSON out, camelCase keys. The database can stay snake_case.
- **Money is in kobo** (whole numbers). ₦10,000 = `1000000`.
- Dates are ISO 8601 strings.
- Errors: non-2xx status with `{ "error": "Plain sentence the UI can show." }` (mock) or `{ "error": { "code": "…", "message": "Plain sentence" } }` (NestJS). The front end reads both.
- Auth: a session cookie (`credentials: "include"`). The mock uses an `ami_session` cookie holding the user id. If the backend is on another domain, it must allow credentials in CORS, or we switch to a bearer token in `api.ts`.

## Auth and profile

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| POST | `/auth/signup` | `SignupInput { name, email, password }` (password ≥ 8) | `201 { user: User }` + session. `409` email already used |
| POST | `/auth/login` | `{ email, password }` | `{ user: User }` + session. `401` wrong details, `403` suspended |
| POST | `/auth/logout` | – | `{ ok: true }` |
| GET | `/me` | – | `{ user: User \| null }` |
| PATCH | `/me` | `UpdateProfileInput` (socialAccounts replaces the whole list) | `{ user: User }`. Not used by any screen yet (there is no profile page) |

**Test account.** For the demo, every Log in and Sign up button (and every page that needs an account) signs people in as one shared test account in a single click, with no form. The front end calls `POST /auth/login` with `tolu@demo.ami` / `demo1234`, so **the backend must seed that account** (a creator with videos, so both selling and buying can be shown). Change it with `NEXT_PUBLIC_TEST_ACCOUNT_EMAIL` and `NEXT_PUBLIC_TEST_ACCOUNT_PASSWORD`. The `/login` form is still there for other accounts, such as `admin@demo.ami` for `/admin`.

## Videos

| Method | Path | Body / query | Returns |
| --- | --- | --- | --- |
| GET | `/videos?q=&category=` | `q` is free text: a title, a creator, or a description of the moment ("bride dancing at a wedding") | `{ videos: Video[] }`, live only. Newest first, or best match first when `q` is set |
| GET | `/videos/:id` | – | `{ video: Video }`. Hidden or under-review videos only for the creator or an admin, else `404` |
| POST | `/videos` | `CreateVideoInput` (title, description, category, `basePriceKobo`, `rightsConfirmed`, file facts) | `201 { video: Video }`. `400` no title, unknown category, rights not confirmed or price under ₦1,000; `409` same `fileSha256` already registered; `413` over 200 MB |
| PATCH | `/videos/:id` | `UpdateVideoInput` (title, description, status live/hidden, basePriceKobo) | `{ video: Video }`. Creator only |

**Upload, real backend:** the mock receives metadata plus a browser-computed `fileSha256` and a thumbnail data URL. The real flow should be: get a signed upload URL → upload the MP4 to storage → `POST /videos` with the storage key → ffmpeg worker makes the watermarked preview and thumbnail and sets `previewUrl` / `thumbnailUrl`. The upload screen has a `TODO(Eradiri)` where real progress plugs in.

Categories: Comedy, Food, Dance, Owambe, Lifestyle (`CATEGORIES` in `src/lib/pricing.ts`).

**Search, later:** today the mock scores word matches across title, description, category, creator and tags. The plan is to embed videos in a vector database so `q` can find the right moment inside a clip; the response shape stays the same.

## Checkout and payment

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| POST | `/checkout` | `CheckoutInput { videoId, part, duration }` | `201 CheckoutResult { licenceNumber, paymentReference, amountKobo, paymentUrl }` |
| GET | `/payments/:reference` | – | `PaymentSession` (buyer only) |
| GET | `/payments/callback?reference=&status=` | – | The bank redirects here after checkout. The server verifies with the bank, then redirects to `/licences/:number?paid=1`, or back to `/pay/:reference` while it is still pending or failed |
| POST | `/payments/:reference/confirm` | – | `PaymentSession`. Buyer only. Asks the bank to verify again; the `/pay` page calls it until the payment settles |
| POST | `/payments/:reference/simulate` | `{ outcome: "paid" \| "failed" }` | `{ status, licence }`. **Demo switch only** (`ALLOW_PAYMENT_SIMULATION=true`) |

A licence covers the **whole video** (`part: null`) or **part of it** (`part: { startSec, endSec }`, whole seconds, at least 2 seconds), for a **duration**: `"1m"`, `"3m"`, `"1y"` or `"forever"`.

Rules the server enforces at checkout: logged in, video is live, not your own video, a known duration, a valid part (a part covering the whole video is stored as `null`). Price is calculated **on the server** from the creator's one price, `basePriceKobo` (the whole video for 1 month, suggested ₦5,000):

```
share      = part ? max(0.25, partSeconds / videoSeconds) : 1
multiplier = 1m ×1, 3m ×2, 1y ×3, forever ×4
price      = max(₦1,000, roundUpTo₦500(basePrice × share × multiplier))
platformFee = round(price × 0.15)
creatorShare = price − platformFee
```

`licencePriceKobo` in `src/lib/pricing.ts` is the reference implementation; the video page uses the same function to show the price as people choose.

Checkout creates the licence as `pending` and a payment as `initiated`. `paymentUrl` is where the browser goes next: today `/pay/:reference` (the sandbox stand-in page); with Access Bank it becomes the bank's checkout URL, with a callback back to `/licences/:licenceNumber?paid=1`.

`PaymentSession` includes `paymentUrl`. When it points back at `/pay/:reference` (the mock), that page stands in for the bank and calls `/simulate`; add `?status=failed` to see the failure screen. When it points at the bank (`pay.xtradot.co`), the page calls `/confirm` every few seconds until the payment settles, and **Try again** sends the buyer back to the bank's page.

**On payment confirmed** (Access Bank webhook or callback): mark payment `paid` with `paidAt`, set licence `active`, `startsAt = now`, `endsAt = now + duration` (null for forever), and credit the creator's earnings. A licence whose `endsAt` has passed is reported as `expired`.

## Licences

| Method | Path | Returns |
| --- | --- | --- |
| GET | `/licences/:number` | `{ licence: Licence }` for the buyer, the video's creator, or an admin. Others get `404` |
| GET | `/licences/:number/download` | `DownloadLink { url, expiresAt }`, a short-lived signed link to the clean original. Buyer of an **active** licence only (`403` otherwise) |
| GET | `/check/:number` | **Public.** `LicenceCheck { status: "valid" \| "expired" \| "not_found", licence }`. Pending licences count as not found. No prices or emails |

Licence numbers look like `AMI-7K3Q-92XD`: two blocks of four from `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (no 0/O or 1/I). The front end normalises what people type (`ami7k3q92xd` → `AMI-7K3Q-92XD`).

The certificate is rendered by the front end at `/licences/:number/certificate` (Save as PDF). Its QR code opens `${NEXT_PUBLIC_SITE_URL}/check/:number`.

## Library

`GET /library` → `Library`:

- `totals`: videos, licencesSold, earningsKobo, pendingPayoutKobo (equal to earnings until real payouts exist)
- `videos`: the user's videos with `licencesSold` and `earningsKobo`
- `sales`: paid licences on the user's videos (buyer, part, duration, dates, creator share)
- `licences`: paid licences the user bought

## Payouts (creators)

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| GET | `/banks` | – | `{ banks: { code, name }[] }` |
| GET | `/payouts` | – | `{ balanceKobo, account, payouts }` |
| POST | `/payouts/account/enquiry` | `{ bankCode, accountNumber }` | `{ accountName }` from the bank's name enquiry |
| PUT | `/payouts/account` | `{ bankCode, accountNumber }` | saves the account with the bank's resolved name |
| POST | `/payouts` | `{ amountKobo }` | `201 { payout: { reference, status } }`. Status is `pending`, `successful`, `failed` or `unknown` (timed out; re-checked, never resent) |

## Platform

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/healthz` (no `/api` prefix) | Readiness probe; both the client and the server answer it |
| POST | `/hooks/forge` | Bank webhooks. Signed with HMAC-SHA256 over `"{x-forge-timestamp}.{raw body}"`; repeats are ignored by `event_id` |

## Admin (accounts with `isAdmin`)

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| GET | `/admin` | – | `AdminOverview { counts, users, videos, transactions }` |
| PATCH | `/admin/users/:id` | `{ suspended?, verified? }` | `{ user: User }` |
| PATCH | `/admin/videos/:id` | `{ status: "live" \| "hidden" \| "under_review" }` | `{ video: Video }` |

## Mock only

`POST /dev/reset` restores the seeded data (disabled in production unless `AMI_ALLOW_RESET=1`).
