# careseeker API

NestJS API with Prisma and Supabase JWT auth.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `SUPABASE_JWT_SECRET`.
2. Install: `pnpm install`
3. Generate Prisma client: `pnpm exec prisma generate`
4. Run migrations: `pnpm exec prisma migrate dev`

## Run

- Dev: `pnpm start:dev`
- Build: `pnpm build`
- Start prod: `pnpm start:prod`

## Endpoints

- `GET /health` — health check
- `GET /me` — current user (requires `Authorization: Bearer <token>`)
