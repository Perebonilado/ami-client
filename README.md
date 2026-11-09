# Àmì client

Front end for Àmì, a marketplace where Nigerian creators list their videos and pages and brands pay in naira for a licence, a clean download and a certificate anyone can check. Built for Access Youth Tech Forge 2026.

Next.js 16 (App Router) · Tailwind CSS 4 · [Base UI](https://base-ui.com/react/components) · TypeScript.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The app runs on **mock data** until the backend is ready: route handlers in `src/app/api/**` serve an in-memory store seeded in `src/lib/mock/db.ts`. Data resets when the dev server restarts. The mock is for local development only: on Vercel, serverless instances don't share memory, so deploy against the real backend.

### Demo accounts

Password for all: `demo1234`

| Account | Email | Use it for |
| --- | --- | --- |
| Tolu Adeyemi (creator) | tolu@demo.ami | Upload, library, earnings |
| Ada Nwosu · Zobo & Co. (brand) | brand@demo.ami | Licensing and checkout |
| Femi Lawal · Gist Central (blog) | blog@demo.ami | A second buyer |
| Àmì Admin | admin@demo.ami | Admin dashboard |

Seeded licence numbers to try on `/check`: `AMI-7K3Q-92XD` (valid), `AMI-EXP2-4R8M` (expired).

## Screens

| Route | Screen |
| --- | --- |
| `/` | Landing page with the latest videos, how it works, pricing, licence check |
| `/browse` | Search by title, creator or tag; filter by category |
| `/videos/:id` | Watermarked preview and licence picker with live price |
| `/pay/:reference` | Payment sandbox stand-in (also the hidden "simulate payment" switch) |
| `/licences/:number` | Licence details, Download video, Download certificate |
| `/licences/:number/certificate` | Printable certificate with QR code |
| `/check`, `/check/:number` | Public licence check (what the QR code opens) |
| `/upload` | File, details, prices, declarations, publish |
| `/library` | My videos (sales, earnings) and My licences |
| `/library/videos/:id` | Edit prices, switch licence types off, hide a video |
| `/login`, `/signup`, `/profile` | Accounts and social handles |
| `/admin` | Counts, users, videos, transactions (admins only) |

## Connecting the backend

Everything goes through `src/lib/api.ts`. The routes and shapes are in [docs/API.md](docs/API.md), and the types are in `src/lib/types.ts`.

Environment variables:

| Variable | What it does |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL. Defaults to `/api` (the mock) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL used in certificate QR codes. Set it to the deployed URL so judges' phones can open it |

## Project layout

```
src/
  app/            routes (each screen keeps its own _components/)
  app/api/        mock API route handlers
  components/     shared UI: header, video card, player, logo
  components/ui/  Base UI wrappers: button, field, select, tabs, radio cards, switch, progress, badges
  lib/            api client, types, pricing rules, formatting, mock database
public/samples/   generated preview clips used by the mock
```
