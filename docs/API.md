# Àmì API contract

The front end talks to the backend only through `src/lib/api.ts`. Today those calls hit mock route handlers in `src/app/api/**` (in-memory data, seeded from `src/lib/mock/db.ts`). To switch to the real backend, set `NEXT_PUBLIC_API_URL` (for example `https://api.ami.ng`) and implement the routes below with the same shapes.

Exact request and response types live in [`src/lib/types.ts`](../src/lib/types.ts). This page is the summary.

## Conventions

- JSON in, JSON out, camelCase keys. The database can stay snake_case.
- **Money is in kobo** (whole numbers). ₦10,000 = `1000000`.
- Dates are ISO 8601 strings.
- Errors: non-2xx status with `{ "error": "Plain sentence the UI can show." }`.
- Auth: a session cookie (`credentials: "include"`). The mock uses an `ami_session` cookie holding the user id. If the backend is on another domain, it must allow credentials in CORS, or we switch to a bearer token in `api.ts`.
- Handles are stored without `@`. Covered accounts on licences are stored with `@`.

## Auth and profile

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| POST | `/auth/signup` | `SignupInput` (name, email, password ≥ 8, optional businessName, socialAccounts) | `201 { user: User }` + session |
| POST | `/auth/login` | `{ email, password }` | `{ user: User }` + session. `401` wrong details, `403` suspended |
| POST | `/auth/logout` | – | `{ ok: true }` |
| GET | `/me` | – | `{ user: User \| null }` |
| PATCH | `/me` | `UpdateProfileInput` (socialAccounts replaces the whole list) | `{ user: User }` |

## Videos

| Method | Path | Body / query | Returns |
| --- | --- | --- | --- |
| GET | `/videos?q=&category=` | `q` matches title, creator name, business name, tags | `{ videos: Video[] }`, live only, newest first |
| GET | `/videos/:id` | – | `{ video: Video }`. Hidden or under-review videos only for the creator or an admin, else `404` |
| POST | `/videos` | `CreateVideoInput` | `201 { video: Video }`. `400` missing declarations or no enabled price, `409` same `fileSha256` already registered, `413` over 200 MB |
| PATCH | `/videos/:id` | `UpdateVideoInput` (title, description, status live/hidden, prices) | `{ video: Video }`. Creator only |

**Upload, real backend:** the mock receives metadata plus a browser-computed `fileSha256` and a thumbnail data URL. The real flow should be: get a signed upload URL → upload the MP4 to storage → `POST /videos` with the storage key → ffmpeg worker makes the watermarked preview and thumbnail and sets `previewUrl` / `thumbnailUrl`. The upload screen has a `TODO(Eradiri)` where real progress plugs in.

`Video.fromPriceKobo` is the cheapest enabled base price, or `null`.

## Checkout and payment

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| POST | `/checkout` | `CheckoutInput` `{ videoId, useType, platform, duration, coveredAccounts }` | `201 CheckoutResult { licenceNumber, paymentReference, amountKobo, paymentUrl }` |
| GET | `/payments/:reference` | – | `PaymentSession` (buyer only) |
| POST | `/payments/:reference/simulate` | `{ outcome: "paid" \| "failed" }` | `{ status, licence }`. **Mock only, and the hidden demo-day switch** |

Rules the server enforces at checkout: logged in, video is live, not your own video, use type enabled, at least one covered account. Price is calculated **on the server**:

```
price = basePrice(useType) × duration (30d ×1, 90d ×2, 1y ×5, lifetime ×10) × platform (one ×1, all ×2)
platformFee = round(price × 0.15)
creatorShare = price − platformFee
```

Checkout creates the licence as `pending` and a payment as `initiated`. `paymentUrl` is where the browser goes next: today `/pay/:reference` (the sandbox stand-in page); with Access Bank it becomes the bank's checkout URL, with a callback back to `/licences/:licenceNumber?paid=1`.

**On payment confirmed** (Access Bank webhook or callback): mark payment `paid` with `paidAt`, set licence `active`, `startsAt = now`, `endsAt = now + duration` (null for lifetime), and credit the creator's earnings. A licence whose `endsAt` has passed is reported as `expired`.

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
- `sales`: paid licences on the user's videos (buyer, platform, covered accounts, dates, creator share)
- `licences`: paid licences the user bought

## Admin (accounts with `isAdmin`)

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| GET | `/admin` | – | `AdminOverview { counts, users, videos, transactions }` |
| PATCH | `/admin/users/:id` | `{ suspended?, verified? }` | `{ user: User }` |
| PATCH | `/admin/videos/:id` | `{ status: "live" \| "hidden" \| "under_review" }` | `{ video: Video }` |

## Mock only

`POST /dev/reset` restores the seeded data (disabled in production unless `AMI_ALLOW_RESET=1`).
