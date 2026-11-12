# Locura TCG

A membership club for TCG collectors: members pay one monthly subscription (in PEN, via Culqi) and are automatically entered in every Pokémon and One Piece prize raffle while it is active. There are no points or tickets.

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
- Live raffles are drawn automatically once their draw date passes (the next time anyone loads the raffles), or right away with **Draw winner now**. Every member whose paid period is still running has one chance, and one is picked at random. The members who took part are saved with the raffle.
- Uploaded images are stored in an `uploads` folder next to the database, so on Railway they live on the volume too.
- A raffle can only be deleted before anyone has entered; drawn raffles can't be edited.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` then `npm start` | Production build and server |
| `npm run typecheck` | TypeScript check |
| `npm run grant -- you@example.com 30` | Give an account a membership for that many days without paying (testing, comps) |
| `npm run draw` | Draw every live raffle whose draw date has passed (the site also does this automatically) |
| `npm run draw -- <raffleId>` | Draw one raffle right now |

## Where things are

```
src/
  routes/                 one file per page (file-based routing)
    index.tsx             home
    raffles/index.tsx     /raffles
    raffles/$raffleId.tsx /raffles/:id, with the "you're in" panel
    membership.tsx        the plan + Culqi checkout
    winners.tsx, rules.tsx
    login / register / forgot-password / reset-password
    _authed.tsx           guard: pages under _authed/ need a signed-in user
    _authed/dashboard.tsx "My account"
    admin.tsx, admin/      admin area (raffles list, create/edit form)
    uploads/$file.ts      serves uploaded prize images
  components/             header, footer, raffle card, countdown, etc.
  lib/plan.ts             the single plan: regular and discounted price — edit it here
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

- **Monthly renewals.** Each payment covers 30 days and nothing charges the next month automatically: members renew from the membership page, and a membership that runs out stops entering raffles. Culqi has a Subscriptions API for charging saved cards.
- **Emails.** Password-reset links are printed to the server log, not emailed. Plug a provider into `requestPasswordReset` in `src/server/functions.ts`.
- **Images** of the original raffles still point at `media.base44.com`. Re-upload them from the admin area before you shut down the Base44 app.
- Google sign-in and 2FA from Base44's login screens weren't carried over.
- SQLite needs a host with a persistent disk (Fly.io, Railway, a VPS). For serverless hosting, move to Postgres.
