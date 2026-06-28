# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier (formats all .ts/.tsx files)
npm run typecheck    # TypeScript type checking (no emit)
```

### Database (Drizzle + Neon PostgreSQL)

```bash
npx drizzle-kit generate   # Generate migration from schema changes
npx drizzle-kit migrate    # Apply migrations to DB
npx drizzle-kit studio     # Open Drizzle Studio (DB GUI)
```

### Adding UI components

```bash
npx shadcn@latest add <component>   # e.g. npx shadcn@latest add dialog
```

## Architecture

This is a **Next.js 16 App Router** project using TypeScript, Tailwind CSS v4, and shadcn/ui.

### Auth — Better Auth

- **Server config**: `lib/auth.ts` — configures Better Auth with Drizzle adapter, email/password, and GitHub OAuth.
- **Client**: `lib/auth-client.ts` — `authClient` singleton for use in client components.
- **API route**: `app/api/auth/[...all]/route.ts` — catches all auth requests via `toNextJsHandler`.
- **Route protection**: `proxy.ts` is a Next.js middleware pattern that checks session and redirects unauthenticated users. The `matcher` in `proxy.ts` controls which routes are protected (currently `/dashboard`).

### Database — Drizzle ORM + Neon

- **Connection**: `db/drizzle.ts` — exports `db` using `node-postgres` with SSL required (Neon).
- **Schema**: `db/schema.ts` — defines `user`, `session`, `account`, `verification` tables (Better Auth's required schema).
- **Migrations**: stored in `db/drizzle/`.
- **Config**: `drizzle.config.ts` — points to `db/schema.ts` and outputs to `db/drizzle/`.

### UI

Every and ALL UI elements/components must utilize Shadcn UI. You have the creative liberty to research Shadcn UI components and utilize them as you see fit to create a beautiful and functional UI.

Every and ALL styling must be done utilizing Tailwind CSS v4 utility classes. Do not write custome CSS under any circumstances.

- **Theme**: `components/theme-provider.tsx` wraps the app with `next-themes`. Pressing `d` toggles dark/light mode globally.
- **shadcn config**: `components.json` — style `base-luma`, base color `mauve`, icon library `lucide`. Components install to `components/ui/`.
- **Path alias**: `@/` maps to the repo root (set in `tsconfig.json`).

### Environment Variables

Required in `.env`:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` — random secret for session signing
- `BETTER_AUTH_URL` — server-side base URL (e.g. `http://localhost:3000`)
- `NEXT_PUBLIC_BETTER_AUTH_URL` — client-side base URL
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — for GitHub OAuth (referenced in `lib/auth.ts`)
