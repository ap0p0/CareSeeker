# TODO – Next Steps

**Current Vercel domain:** `care-seeker.vercel.app`

---

## Vercel Setup

Create **4 Vercel projects** (one per app variant):

| Project             | Domain                          | Build Command             |
| ------------------- | ------------------------------- | ------------------------- |
| careseeker-core     | care-seeker.vercel.app          | `pnpm run build:core`     |
| careseeker-client   | client.care-seeker.vercel.app   | `pnpm run build:client`   |
| careseeker-provider | provider.care-seeker.vercel.app | `pnpm run build:provider` |
| careseeker-admin    | admin.care-seeker.vercel.app    | `pnpm run build:admin`    |

**Settings for each project:**

- **Root Directory:** `apps/web`
- **Build Command:** see table above
- **Output Directory:** `dist`
- **Install Command:** `pnpm install`
- **Framework Preset:** Vite

---

## Environment Variables (per Vercel project)

### Core (care-seeker.vercel.app)

| Variable                 | Value                                                           |
| ------------------------ | --------------------------------------------------------------- |
| `VITE_APP_VARIANT`       | `core`                                                          |
| `VITE_PUBLIC_BASE_URL`   | `https://care-seeker.vercel.app` _(or custom domain when live)_ |
| `VITE_SUPABASE_URL`      | _(your Supabase project URL)_                                   |
| `VITE_SUPABASE_ANON_KEY` | _(your Supabase anon key)_                                      |
| `VITE_API_URL`           | `https://api.care-seeker.vercel.app` _(optional)_               |

### Client (client.care-seeker.vercel.app)

| Variable                 | Value                                             |
| ------------------------ | ------------------------------------------------- |
| `VITE_APP_VARIANT`       | `client`                                          |
| `VITE_PUBLIC_BASE_URL`   | `https://client.care-seeker.vercel.app`           |
| `VITE_SUPABASE_URL`      | _(your Supabase project URL)_                     |
| `VITE_SUPABASE_ANON_KEY` | _(your Supabase anon key)_                        |
| `VITE_API_URL`           | `https://api.care-seeker.vercel.app` _(optional)_ |

### Provider (provider.care-seeker.vercel.app)

| Variable                 | Value                                             |
| ------------------------ | ------------------------------------------------- |
| `VITE_APP_VARIANT`       | `provider`                                        |
| `VITE_PUBLIC_BASE_URL`   | `https://provider.care-seeker.vercel.app`         |
| `VITE_SUPABASE_URL`      | _(your Supabase project URL)_                     |
| `VITE_SUPABASE_ANON_KEY` | _(your Supabase anon key)_                        |
| `VITE_API_URL`           | `https://api.care-seeker.vercel.app` _(optional)_ |

### Admin (admin.care-seeker.vercel.app)

| Variable                 | Value                                             |
| ------------------------ | ------------------------------------------------- |
| `VITE_APP_VARIANT`       | `admin`                                           |
| `VITE_PUBLIC_BASE_URL`   | `https://admin.care-seeker.vercel.app`            |
| `VITE_SUPABASE_URL`      | _(your Supabase project URL)_                     |
| `VITE_SUPABASE_ANON_KEY` | _(your Supabase anon key)_                        |
| `VITE_API_URL`           | `https://api.care-seeker.vercel.app` _(optional)_ |

---

## DNS (care-seeker.vercel.app)

Add CNAME records pointing to Vercel (or your host):

| Name       | Type    | Value                                             |
| ---------- | ------- | ------------------------------------------------- |
| `@` (root) | CNAME/A | `cname.vercel-dns.com` or your project Vercel URL |
| `client`   | CNAME   | `cname.vercel-dns.com` or project URL             |
| `provider` | CNAME   | `cname.vercel-dns.com` or project URL             |
| `admin`    | CNAME   | `cname.vercel-dns.com` or project URL             |
| `api`      | CNAME   | _(API host, if separate)_                         |

Until custom domains are configured, your apps are available at `care-seeker.vercel.app` (or per-project URLs like `care-seeker-core.vercel.app` if you use multiple projects).

---

## Supabase

**Redirect URLs** (Supabase → Authentication → URL Configuration):

- `https://care-seeker.vercel.app/**` _(current)_
- `https://care-seeker.vercel.app/**` _(when custom domain is live)_
- `https://client.care-seeker.vercel.app/**`
- `https://provider.care-seeker.vercel.app/**`
- `https://admin.care-seeker.vercel.app/**`
- `http://localhost:3000/**` _(dev)_
- `http://client.localhost:3000/**` _(dev, when using start:all)_
- `http://provider.localhost:3000/**` _(dev, when using start:all)_
- `http://admin.localhost:3000/**` _(dev, when using start:all)_

---

## API (NestJS @ api.care-seeker.vercel.app)

**CORS origins** – allow:

- `https://care-seeker.vercel.app`
- `https://client.care-seeker.vercel.app`
- `https://provider.care-seeker.vercel.app`
- `https://admin.care-seeker.vercel.app`

---

## Stripe

Webhook endpoint: `https://api.care-seeker.vercel.app/webhooks/stripe` (on backend, not frontend). Configure in Stripe Dashboard.

---

## Local Development

### Run one app

```bash
pnpm start:core      # or start:client, start:provider, start:admin
pnpm --filter web dev   # uses core by default if VITE_APP_VARIANT not set
```

### Run all apps (subdomain-style for cross-app testing)

```bash
pnpm start:all
```

Then open:

| URL                            | App      |
| ------------------------------ | -------- |
| http://localhost:3000          | core     |
| http://client.localhost:3000   | client   |
| http://provider.localhost:3000 | provider |
| http://admin.localhost:3000    | admin    |

`*.localhost` resolves to 127.0.0.1. HMR works on all apps. Add the localhost URLs to Supabase redirect URLs for auth.
