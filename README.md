# CareSeeker

CareSeeker is a two-sided care marketplace powered by AI, verification, and human advocacy — designed to connect care seekers and caregivers with unprecedented accuracy, safety, and dignity.

## Build and Deployment

The web app (`apps/web`) is a single Vite + React codebase that ships four app variants via `VITE_APP_VARIANT`: `core` (careseeker.com), `client` (client.careseeker.com), `provider` (provider.careseeker.com), and `admin` (admin.careseeker.com). Each variant is built and deployed separately.

### How to build

```bash
# Install dependencies (from repo root)
pnpm install

# Build each app variant from monorepo root:
pnpm --filter web build:core      # → dist/ for careseeker.com
pnpm --filter web build:client    # → dist/ for client.careseeker.com
pnpm --filter web build:provider  # → dist/ for provider.careseeker.com
pnpm --filter web build:admin     # → dist/ for admin.careseeker.com
```

Or from `apps/web`:

```bash
cd apps/web
pnpm run build:core
pnpm run build:client
pnpm run build:provider
pnpm run build:admin
```

Each command outputs to `apps/web/dist/`. `VITE_APP_VARIANT` is set by the build script.

### Run all apps locally (fixed ports)

To run all four web variants locally with fixed ports:

```bash
pnpm start:all
```

Then open:

- http://localhost:3000 (core)
- http://localhost:3001 (admin)
- http://localhost:3002 (provider)
- http://localhost:3003 (client)

Run backend API on port 2000:

```bash
pnpm start:api
```

See `TODO.md` for Vercel and deployment setup.
