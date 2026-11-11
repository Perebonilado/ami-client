# Àmì backend plan

What the NestJS backend needs to do, how it should be built, and the tables it needs. The endpoints and response shapes the front end already uses are in [API.md](./API.md); the front end calls them through RTK Query (`src/store/api.ts`).

## 1. What the backend does

- Creators sign up, upload videos and set one price (the whole video for 1 month).
- Buyers license the whole video or part of it, for 1 month, 3 months, 1 year or forever, and pay through the Xtradot Bank sandbox (Access Bank's hackathon bank).
- Àmì keeps 15%, credits the creator 85%, and pays creators out to their bank account.
- Every paid licence gets a number (`AMI-7K3Q-92XD`), a certificate and a public check page.
- Search understands what people mean ("bride dancing at a wedding") using the Huawei AI models in the sandbox.
- AI agents can search and license clips over MCP (promised on the home page).

## 2. Where it runs

```
Browser ──https──> team04.xtradot.co ──> Next.js (public "app" Service, port 80)
                                            │  /api/* is proxied, so cookies stay on one domain
                                            ▼
                                     NestJS "api" (internal Service, port 8080)
                                       │            │                │
                                    MySQL     Xtradot Bank      Huawei MaaS
                                  (our data)  sandbox API       (GLM / DeepSeek)
```

- Only the Next.js app is public. The bank and AI APIs only answer calls from inside our namespace, so every bank and AI call is made by NestJS.
- One key (the `GATEWAY_KEY` env var, from the `huawei-gateway` secret) unlocks both: header `x-api-key` for the bank, `apikey` for Huawei. Never put it in code, an image or a log.
- The bank and AI share **60 requests a minute** for the whole team. Cache, batch and never call either on page load.
- Bank data lives in memory and resets when the platform restarts. **Our database is the source of truth**; the bank is where money moves.
- Quota for the whole namespace: 10 pods, 768Mi memory requested (2Gi limit), 5 Services, one 10Gi volume. Rough split: MySQL 384Mi, NestJS 256Mi, Next.js 128Mi.
- Only made-up (synthetic) data, even in logs and seed files.

## 3. Stack and structure (same as SoloBankingServer)

| Area | Choice |
| --- | --- |
| Runtime | Node 22, NestJS 12 on Express 5, TypeScript as ES modules (relative imports end in `.js`) |
| Database | MySQL 8.4 with Sequelize 6 + sequelize-typescript; never `sync()` |
| Migrations | Umzug, numbered files in `migrations/` (`0001-users.migration.ts`), each with `up` and `down` |
| Money | bignumber.js for every calculation (prices, splits, fees, naira and kobo conversion, balances); stored as `BIGINT` kobo |
| Validation | class-validator DTOs with a global `ValidationPipe({ whitelist, transform })` |
| Config | `@nestjs/config`, read with `config.getOrThrow` in provider factories; list every key in `.env.example` |
| Auth | `jsonwebtoken` (HS256), a custom guard and a `revoked_tokens` table for log out |
| HTTP calls | Built-in `fetch` with `AbortSignal.timeout(...)` |
| Tests and lint | Vitest (`*.spec.ts`, `*.e2e-spec.ts`), oxlint, Prettier |

Folder layout (ports and adapters, writes separate from reads), as in SoloBankingServer:

- `src/business/`: plain domain code, no Nest or Sequelize imports.
  - `domain/`: entities such as `Licence`, plus values like `toKobo` and errors.
  - `ports/` and `repositories/`: interfaces, each with a Symbol token.
  - `handlers/<area>/*.handler.ts`: one class per write, for example `CreateCheckoutHandler`.
- `src/query/`: one class per read, for example `SearchVideosQuery`.
- `src/web/`: controllers, Sequelize models, repositories, adapters (bank, AI), security, DTOs, filters and providers.
- Register handlers, queries and repositories or adapters in `handler.providers.ts`, `query.providers.ts` and `infrastructure.providers.ts`.
- Writes that touch money run inside `UnitOfWork.runInTransaction`, locking rows with `SELECT … FOR UPDATE`.
- Errors are `DomainError(code, status, message)`, returned as `{ "error": { "code", "message" } }`. The front end reads this shape.

What Àmì adds that SoloBankingServer doesn't have:

- **Cookie sessions.** Put the JWT in an httpOnly cookie (`ami_session`, `SameSite=Lax`, `Secure`). The front end sends `credentials: "include"`, so there's no bearer header to manage.
- **Health check.** `GET /healthz` returns 200, for the Kubernetes readiness probe.
- **Webhook receiver** for bank events, with signature checks (section 6).
- **Scheduled jobs** (`@nestjs/schedule`): re-check pending payments and payouts, expire licences, retry failed webhook work.
- **A Dockerfile** built for `linux/amd64`, listening on `0.0.0.0:8080`.
- **Adapters switched by env**, like SoloBankingServer's `ACCOUNT_RESOLVER=mock|paystack`:
  - `BANK_ADAPTER=mock|xtradot`
  - `AI_ADAPTER=mock|maas`

  Locally we can't reach the sandbox, so the mocks keep development moving.

## 4. Services

Each service below is a group of handlers and queries, not a separate deployment. Everything ships as one NestJS app.

| Service | What it does | Our endpoints | Bank / AI calls |
| --- | --- | --- | --- |
| **Accounts** | Sign up, log in, log out, who am I, profile, admin flags. Seeds the shared test account (`tolu@demo.ami`) that every Log in button uses | `/auth/*`, `/me` | Optional: `POST /identity/nin/verify` to verify creators (the blue tick) |
| **Catalogue** | Video upload (metadata, file fingerprint, size and price checks), preview and thumbnail, hide or show, price changes | `/videos`, `/videos/:id` | AI: suggest title, tags and search keywords on upload (section 7) |
| **Search** | Turns what people type into keywords and finds matching videos | `GET /videos?q=` | AI: intent to keywords, cached (section 7) |
| **Licensing** | Prices a licence (whole or part, duration), creates it as `pending`, issues the number, certificate data, download links and the public check; expires licences | `/checkout`, `/licences/*`, `/check/:number` | none |
| **Payments** | Starts the bank's hosted checkout, handles the redirect back, verifies with the bank, then activates the licence and credits the creator | `/payments/*`, `/payments/callback` | `POST /payments/checkout`, `GET /payments/{reference}/verify` |
| **Earnings and payouts** | Creator balance (a ledger), saving a payout account after a name check, paying creators out | `/payouts/*` (new) | `POST /transfers/{intra or interbank}/name-enquiry`, `POST /transfers/{intra or interbank}`, `GET /transfers/{reference}`, `POST /transfers/interbank/requery`, `GET /tariff` |
| **Webhooks** | Receives bank events, checks the signature, ignores repeats, hands each to Payments or Payouts | `POST /api/hooks/forge` (internal URL) | `POST /webhooks` once at start-up |
| **Reconciliation** | Daily: compares our paid payments with the bank's settlements | none (job) | `GET /settlements`, `POST /reconciliation` |
| **Library** | A creator's videos, sales and earnings; a buyer's licences | `/library` | none |
| **Admin** | Users, videos and transactions; suspend, verify, hide | `/admin/*` | none |
| **Agents (MCP)** | MCP server so AI agents can search, quote and start a checkout | `/mcp` | uses Search and Licensing |

### The bank adapter (one place for every bank call)

`BankPort` with an `XtradotBankAdapter`:

- **Base URL and key.** `http://bank-api.ingress-apisix.svc.cluster.local/v1`, header `x-api-key: ${GATEWAY_KEY}`. 30-second timeout (the gateway's limit).
- **Idempotency.** Every POST that moves money or creates a record sends `Idempotency-Key: <uuid>`. Store the key with the row before calling, and reuse it on retry. The same key with the same body replays the first answer (`Idempotent-Replayed: true`); the same key with a different body returns 409.
- **Amounts.** The bank uses naira with two decimals; we store kobo. Convert only in the adapter (`kobo / 100` going out, `Math.round(naira * 100)` coming back).
- **Responses.** Unwrap the bank's envelope (`{ status, data, error, request_id }`). Turn bank error codes into our `DomainError`s, and log `request_id` (support asks for it).
- **429 `RATE_LIMITED`.** Back off and try later. Never loop.
- **504 `TIMEOUT` on a transfer.** The outcome is unknown. **Never send it again.** Mark it `unknown` and re-check it (section 5.2).
- **Testing failures.** In development, the `x-test-outcome` header (`successful|failed|pending|timeout|reversed`) and amounts ending `.01` to `.05` trigger failures on purpose.

The guide calls *Sandbox API Mock Specification v2* the exact contract. Check request and response field names there before coding each call.

## 5. Money flows

### 5.1 Buying a licence (collections)

1. Buyer presses **Continue to payment** → `POST /checkout { videoId, part, duration }`.
2. We work out the price on the server (formula in API.md). In one transaction we create:
   - the `licence` (`pending`)
   - a `payment` (`initiated`) with our own `reference` (for example `AMI-PAY-…`) and a new idempotency key.
3. We call bank `POST /payments/checkout` with:
   - amount (naira)
   - our reference
   - customer email and name
   - `callback_url = https://team04.xtradot.co/pay/callback`

   It returns a `payment_url` on `pay.xtradot.co`. We save it and send it to the front end as `paymentUrl`.
4. The buyer pays on the bank's hosted page (card, transfer, USSD or QR). Test card `5399830000000008`, any future expiry, CVV `123`, PIN `1234`, OTP `123456`.
5. The bank redirects to our callback with `reference` and `status`. **Don't trust the redirect.** Call `GET /payments/{reference}/verify` and give value only if the bank says it's paid.
6. On a verified payment, in one transaction:
   - payment `paid`
   - licence `active`, `starts_at = now`, `ends_at = now + duration` (null for forever)
   - ledger: creator +85%, Àmì +15%.

   Then redirect the buyer to `/licences/:number?paid=1`.
7. The `payment.successful` webhook may arrive before or after the redirect. Both paths call the same idempotent handler, so the licence is only activated once.
   - `payment.failed`: the buyer sees "Your payment didn't go through".
   - `partial` or `overpaid`: hold the licence for admin review.

Card and POS fees are 1.5%, capped at ₦2,000. Transfer, USSD and QR cost a flat ₦50. These come off what Àmì receives, so record `fee_kobo` from the verify response.

The sandbox has no split payments, escrow or refunds (they return `404 NOT_FOUND`). So the creator's 85% is tracked in our ledger and paid out separately (5.2). A refund means an admin pays the buyer back by transfer.

### 5.2 Paying creators (transfers)

1. **Add a payout account.** The creator picks a bank (`GET /banks`) and enters an account number. We call name enquiry (`/transfers/intra/name-enquiry` for Xtradot Bank, NIP `000014`; otherwise `/transfers/interbank/name-enquiry`), show the resolved name, and save it once the creator confirms.
2. **Request a payout.** The amount is checked against the creator's ledger balance. Lock the balance by writing a `payout` row (`pending`) and a matching ledger debit in one transaction.
3. **Name enquiry again, right before sending.** The `name_enquiry_ref` works once and expires after 10 minutes.
4. **Send the transfer** from Àmì's account with the payout's idempotency key and a fixed `reference`:
   - Intra (same bank) returns 201 straight away, with no fee.
   - Interbank returns 202 `pending` and settles in about 5 seconds.

   Save `fee`, `vat`, `stamp_duty` and `total_debit` from the response. Don't hard-code charges; they can change (`GET /tariff`).
5. **Final status** comes from the `transfer.successful`, `failed` or `reversed` webhook, or from polling `GET /transfers/{reference}`. On `failed` or `reversed`, add the money back to the creator's balance.
6. **On 504 TIMEOUT:**
   - mark the payout `unknown`
   - re-check it with `GET /transfers/{reference}` or `POST /transfers/interbank/requery` (job every minute)
   - never resend. Resending is the double-debit bug the judges test for.

Àmì's own account: use one of the team's accounts. The corporate account `0123456793` (₦12,000,000) suits it. Confirm with `GET /settlements` which account checkout money lands in. Watch the KYC limits; corporate allows ₦10,000,000 per transfer and ₦100,000,000 per day.

### 5.3 Webhooks

- Register once at start-up: `POST /webhooks { url: "http://api.team04.svc.cluster.local/api/hooks/forge", events: ["*"] }`. Store the `webhook_secret` it returns once.
- **Check the signature on every delivery.**
  - Header `x-forge-signature` must equal `sha256=` + HMAC-SHA256(secret, `"{x-forge-timestamp}.{raw body}"`).
  - Compare in constant time, against the **raw** body, so turn on raw-body parsing for this route.
  - Reject timestamps more than 5 minutes old.
- Reply 2xx within 10 seconds. Save the event to `webhook_events` first (unique `event_id`, so repeats are ignored), then process it. The bank retries after 1 min, 5 min, 15 min, 1 h and 6 h.
- Events we use:
  - `payment.pending|successful|failed|partial|overpaid`
  - `transfer.pending|successful|failed|reversed`
  - `settlement.completed`

## 6. Tables

Conventions as in SoloBankingServer:

- snake_case plural table names
- UUID v4 ids
- `created_at` and `updated_at` on every table
- money as `BIGINT` in kobo with a `_kobo` suffix, plus a CHECK that it is ≥ 0
- enums as MySQL `ENUM`
- constraints and indexes named explicitly.

**users**: `id`, `name`, `email` (unique), `password_hash`, `business_name` (null), `avatar_url` (null), `is_admin`, `verified`, `suspended`.

**revoked_tokens**: `token_id` (pk), `user_id`, `expires_at` (indexed). Same as SoloBankingServer, for log out.

**videos**

| Column | Type | Notes |
| --- | --- | --- |
| `creator_id` | uuid → users | indexed |
| `title`, `description` | varchar(120), text | |
| `category` | enum | Comedy, Food, Dance, Owambe, Lifestyle |
| `tags` | json | creator's tags |
| `ai_keywords` | json | added by AI on upload (section 7) |
| `search_text` | text | title + description + tags + category + creator name + AI keywords, lower case; searched with Sequelize `Op.like` |
| `duration_sec` | int | |
| `base_price_kobo` | bigint | whole video, 1 month; at least 100000 (₦1,000) |
| `file_sha256` | char(64) | **unique**, stops the same file being listed twice |
| `file_key`, `file_size_bytes` | varchar, bigint | where the clean original is stored |
| `preview_url`, `thumbnail_url` | varchar | watermarked preview and still |
| `status` | enum | `live`, `hidden`, `under_review` |

**licences**

| Column | Type | Notes |
| --- | --- | --- |
| `licence_number` | char(13) | **unique**, `AMI-XXXX-XXXX` (no 0/O or 1/I) |
| `video_id`, `buyer_id` | uuid | indexed |
| `part_start_sec`, `part_end_sec` | int null | both null = whole video |
| `duration` | enum | `1m`, `3m`, `1y`, `forever` |
| `price_kobo`, `platform_fee_kobo`, `creator_share_kobo` | bigint | fixed at checkout |
| `status` | enum | `pending`, `active`, `expired`, `cancelled` |
| `starts_at`, `ends_at` | datetime null | set when payment is verified; `ends_at` null = forever |

**payments**

| Column | Type | Notes |
| --- | --- | --- |
| `licence_id`, `buyer_id` | uuid | a licence can have several attempts; the latest wins |
| `reference` | varchar | **unique**, ours, sent to the bank |
| `idempotency_key` | uuid | **unique**, reused on retry |
| `payment_url` | varchar | the bank's hosted checkout |
| `amount_kobo`, `fee_kobo` | bigint | fee from the verify response |
| `channel` | varchar null | card, transfer, ussd, qr |
| `status` | enum | `initiated`, `pending`, `paid`, `failed`, `partial`, `overpaid` |
| `paid_at`, `bank_request_id` | datetime, varchar | |

**ledger_entries** (the creator's balance is the sum of their entries; never stored as a number we edit)

| Column | Type | Notes |
| --- | --- | --- |
| `account` | enum | `creator`, `platform` |
| `user_id` | uuid null | the creator; null for the platform |
| `amount_kobo` | bigint | positive = credit, negative = debit |
| `kind` | enum | `sale`, `payout`, `payout_reversal`, `adjustment` |
| `licence_id`, `payout_id` | uuid null | what caused the entry |

**payout_accounts**: `user_id` (unique), `bank_code`, `bank_name`, `account_number`, `account_name` (from name enquiry), `verified_at`.

**payouts**

| Column | Type | Notes |
| --- | --- | --- |
| `user_id`, `payout_account_id` | uuid | |
| `amount_kobo`, `fee_kobo`, `vat_kobo`, `stamp_duty_kobo` | bigint | charges from the bank's response |
| `reference`, `idempotency_key` | varchar, uuid | both **unique**; never changed after the first send |
| `name_enquiry_ref`, `session_id` | varchar | session id is the NIP id for interbank |
| `status` | enum | `pending`, `successful`, `failed`, `reversed`, `unknown` (timed out; re-check) |
| `settled_at`, `bank_request_id` | datetime, varchar | |

**webhook_events**: `event_id` (unique), `type`, `payload` (json), `received_at`, `processed_at` (null until handled), `error` (null).

**search_intents** (AI search cache): `query_key` (unique, normalised query), `keywords` (json), `category` (null), `model`, `expires_at`.

**bank_requests** (support log; never store the key): `endpoint`, `method`, `idempotency_key`, `our_reference`, `http_status`, `bank_request_id`, `error_code`, `duration_ms`.

Links: users 1–many videos; videos 1–many licences; licences 1–many payments; users 1–many ledger_entries; users 1–1 payout_accounts; payouts 1–many ledger_entries.

## 7. AI (Huawei MaaS)

- **Endpoint.** `http://huawei-maas.ingress-apisix.svc.cluster.local/openai/v1`. It's OpenAI-compatible; the server calls `POST /chat/completions` with the built-in `fetch` and the header `apikey: GATEWAY_KEY`.
- **Models.** `glm-5.3`, `glm-5.2`, `glm-5.1`, `deepseek-v4.1-flash-1017`, `deepseek-v4.1-flash`, `deepseek-v4-flash`.
  - Keep a list in `MAAS_MODELS` (for example `deepseek-v4.1-flash,glm-5.2`).
  - Use the next model if one returns "not found".
- **Every call:**
  - turn reasoning off (`chat_template_kwargs: { thinking: false }`)
  - `temperature: 0`
  - a small `max_tokens`
  - ask for JSON only.
- **Budget.**
  - Cache results.
  - Time out after 8 seconds and fall back to plain keyword search.
  - Keep AI to about 20 calls a minute, leaving the rest of the team's 60 for the bank.

### 7.1 Search: understanding what people type

1. **When a video is uploaded (one call per video).** AI reads the title, description, category and tags and returns 10 to 20 extra search words: synonyms, Nigerian English and Pidgin terms, the scene and the mood. For example, owambe gives "party, celebration, aso ebi, wedding reception, dancing, aunties". Save them in `ai_keywords` and rebuild `search_text`. This does most of the work, so searches seldom need AI.
2. **When someone searches (`GET /videos?q=`):**
   - Normalise the text (lower case, trim, collapse spaces).
   - Empty text returns newest first.
   - One or two words: skip AI. Match each word against `search_text` with Sequelize `Op.like` and rank by how many words match (no raw SQL; FULLTEXT can come later if the catalogue grows).
   - Three or more words: look in `search_intents` first. On a miss, ask the model for keywords and an optional category, cache the result for 24 hours, then search with those keywords. Boost a matching category.
   - On a timeout, an error or a full AI budget, fall back to the plain words.
   - Return the same `{ videos }` shape as today, so the front end doesn't change.
3. **Prompt sketch:**

```
system: You turn a search for short Nigerian social-media video clips into search keywords.
Categories: Comedy, Food, Dance, Owambe, Lifestyle.
Reply with JSON only: {"keywords": [3 to 8 lowercase words or short phrases], "category": one category or null}.
user: bride dancing at a wedding
→ {"keywords": ["bride", "wedding", "dancing", "owambe", "reception", "celebration"], "category": "Owambe"}
```

The front end searches as people type (after a 250ms pause). The three-words-and-cache rule keeps that within budget. If needed, only send AI searches when the user presses Enter.

### 7.2 Other ways to use the AI

| Use | How | Cost |
| --- | --- | --- |
| **Upload helper** | From the file name and a short note, suggest a title, description, category and tags; the creator edits them before publishing. The same call produces `ai_keywords` | 1 call per upload |
| **Text moderation** | On upload, check the title and description for hate, sexual content or scams. Anything flagged goes to `under_review` for an admin instead of going live | can share the upload call |
| **Agents over MCP** | `/mcp` exposes tools: `search_videos` (same search as above), `get_video`, `quote_licence` (price for a part and duration), `start_checkout` (returns a `payment_url` a person must pay; agents never pay), `check_licence`. Needs its own rate limit | uses Search, no extra AI |
| **Earnings summary** (later) | A short line in the creator's library, such as "Food pages buy short parts of your recipe videos" | 1 call per creator per week, cached |

The listed models are text-only. Searching inside the frames of a video (finding the exact moment visually) needs a vision model the sandbox doesn't offer. Creators' descriptions and AI keywords stand in for it.

## 8. Settings (`.env.example`)

```
PORT=8080
APP_URL=https://team04.xtradot.co          # for callback_url and certificate links
DATABASE_URL=mysql://ami:…@mysql:3306/ami
JWT_SECRET=…
GATEWAY_KEY=…                              # from the huawei-gateway secret; never commit
BANK_ADAPTER=xtradot                       # mock locally
BANK_BASE_URL=http://bank-api.ingress-apisix.svc.cluster.local/v1
AMI_BANK_ACCOUNT=0123456793                # Àmì's account for payouts
WEBHOOK_URL=http://api.team04.svc.cluster.local/api/hooks/forge
AI_ADAPTER=maas                            # mock locally
MAAS_BASE_URL=http://huawei-maas.ingress-apisix.svc.cluster.local/openai/v1
MAAS_MODELS=deepseek-v4.1-flash,glm-5.2
AI_CALLS_PER_MINUTE=20
```

## 9. Build order

1. Project setup copied from SoloBankingServer: config, MySQL, Umzug, error filter, `/healthz`, Dockerfile, mock adapters.
2. Accounts and the seed (test account plus the demo catalogue the front end shows).
3. Catalogue and search without AI, matching API.md. Then point the front end at it (`NEXT_PUBLIC_API_URL`).
4. Licensing, checkout and payments with the real bank sandbox, plus webhooks.
5. Ledger, payout accounts and payouts, plus the re-check jobs.
6. AI keywords on upload, then AI search, then the upload helper and moderation.
7. MCP server.
8. Deploy to the namespace and run the whole flow with the test card, then a payout to a test beneficiary.

## 10. Still to decide

- **MySQL location.** Run it in our namespace on the 10Gi volume, or use a hosted database. That depends on whether the cluster can reach the internet, which nobody has tested.
- **Uploaded files.** For the demo we use placeholder videos. Real uploads need storage (the volume, or an object store) and an ffmpeg step for the watermarked preview, which may be too heavy for our CPU quota.
- **The MCP address.** The home page shows `ami.ai/mcp` for now; set `NEXT_PUBLIC_MCP_URL` once it's real.
- **Checkout details.** Exact request and response fields come from *Sandbox API Mock Specification v2*.
