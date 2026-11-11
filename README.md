# Locura TCG

A membership club for TCG collectors: members pay monthly (in PEN, via Culqi), get vault points, and spend them on entries for Pokémon and One Piece prize raffles.

Rebuilt from the Base44 app at neon-lucky-vault-draw.base44.app as a standalone project. It uses the same framework the Base44 app used (TanStack Start + React + Tailwind), but has its own database and login, so it no longer depends on Base44.

## Run it

```bash
npm install
cp .env.example .env     # add Culqi keys when you have them
npm run dev              # http://localhost:3000
```

On first start it creates `data/pullclub.db` (SQLite) and loads the 8 raffles from the original site.

## Admin

Go to `/admin` to create, edit, publish, unpublish, draw and delete raffles, and upload prize images.

Access is limited to the emails in the `ADMIN_EMAILS` environment variable (comma-separated). Register a normal account with that email, set the variable (in `.env` locally, or in your host's variables), and an **Admin** link appears in the header.

- **Save as draft** keeps a raffle hidden; **Publish** puts it on the site.
- Live raffles are drawn automatically once their draw date passes (the next time anyone loads the raffles), or right away with **Draw winner now**. The pick is random, weighted by entries.
- Uploaded images are stored in an `uploads` folder next to the database, so on Railway they live on the volume too.
- A raffle can only be deleted before anyone has entered; drawn raffles can't be edited.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` then `npm start` | Production build and server |
| `npm run typecheck` | TypeScript check |
| `npm run grant -- you@example.com collector` | Give an account a membership + points without paying (testing, comps) |
| `npm run draw` | Draw every live raffle whose draw date has passed (the site also does this automatically) |
| `npm run draw -- <raffleId>` | Draw one raffle right now |

## Where things are

```
src/
  routes/                 one file per page (file-based routing)
    index.tsx             home
    raffles/index.tsx     /raffles
    raffles/$raffleId.tsx /raffles/:id, with the "spend points" panel
    membership.tsx        tiers + Culqi checkout
    winners.tsx, rules.tsx
    login / register / forgot-password / reset-password
    _authed.tsx           guard: pages under _authed/ need a signed-in user
    _authed/dashboard.tsx "My vault"
    admin.tsx, admin/      admin area (raffles list, create/edit form)
    uploads/$file.ts      serves uploaded prize images
  components/             header, footer, raffle card, countdown, etc.
  lib/tiers.ts            tier prices and points — edit plans here
  lib/culqi.ts            opens Culqi Checkout in the browser
  server/functions.ts     backend logic for members (server functions)
  server/admin-functions.ts  backend logic for the admin area
  server/draw.server.ts   winner draws
  server/db.server.ts     SQLite schema + first-run seed
  server/auth.server.ts   password hashing + session cookies
  server/culqi.server.ts  charges the card token with your secret key
  styles.css              theme colours, fonts, holo/foil effects
scripts/                  draw + grant CLI tools
```

## Not done yet

- **Monthly renewals.** Like the original, joining charges the first month and drops the points once. Nothing charges month 2 yet. Culqi has a Subscriptions API, or run a monthly job that charges saved cards and adds `monthly_points`.
- **Emails.** Password-reset links are printed to the server log, not emailed. Plug a provider into `requestPasswordReset` in `src/server/functions.ts`.
- **Images** of the original raffles still point at `media.base44.com`. Re-upload them from the admin area (and replace `HERO_IMAGE` in `src/routes/index.tsx`) before you shut down the Base44 app.
- Google sign-in and 2FA from Base44's login screens weren't carried over.
- SQLite needs a host with a persistent disk (Fly.io, Railway, a VPS). For serverless hosting, move to Postgres.
