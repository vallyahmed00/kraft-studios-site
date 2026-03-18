# Kraft Studios (static site)

This project is a simple static website (no build step) using:

- `index.html` (homepage)
- `styles.css`
- `script.js`
- `custom-boxes.html` (custom box order page)
- `kick-kraft.html` (redirect/confirmation page after submitting the custom box form)

## What changed

- Branding updated to **Kraft Studios**
- Added **Custom boxes** page for ordering sneaker/display boxes
- After submitting a custom box request, the site redirects to `kick-kraft.html`

## Local run

Any static server works. Examples:

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173`.

## Notes (important)

- **Custom box submissions** are still stored in the visitor’s browser (`localStorage` key `ks_custom_orders`).
- **Booking form** now posts to a Netlify Function at `/.netlify/functions/booking` which stores enquiries in a Supabase `bookings` table.
- **Gallery data** is loaded from and saved to a Supabase `gallery_items` table via `/.netlify/functions/gallery` (with `localStorage` used only as a local cache).
- **Owner panel password**: `kraftstudios2026`

### Supabase setup

Create a Supabase project, then add these tables (SQL example):

```sql
create table public.bookings (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  first_name text,
  last_name text,
  email text not null,
  phone text,
  event_type text,
  event_date date,
  location text,
  message text
);

create table public.gallery_items (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  src text not null,
  type text default 'image',
  caption text,
  cat text default 'All'
);
```

In **Netlify site settings → Environment variables**, set:

- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = service role key (or `SUPABASE_ANON_KEY` with appropriate RLS policies)

## Hosting (frontend, backend, domain)

### Frontend hosting (static)

Recommended options:

- **Netlify**: simplest for static sites; supports form handling + serverless functions.
- **Cloudflare Pages**: very fast global CDN; great if you also use Cloudflare DNS.
- **Vercel**: excellent if you later migrate to Next.js (but still works for static).
- **GitHub Pages**: good for a basic public site.

### Backend services (if you want real order submissions)

Options depending on what you need:

- **Serverless endpoints**: Netlify Functions, Cloudflare Workers, Vercel Functions
- **Node/Express / API server**: Render, Fly.io, Railway
- **Database + auth**: Supabase (Postgres), Firebase

Typical setup for this kind of site:

- Frontend + backend: **Netlify** (static hosting + Netlify Functions)
- Database: **Supabase**

### Domain + DNS

- Buy domain: Cloudflare Registrar, Namecheap, or Squarespace Domains
- Use DNS: Cloudflare DNS (recommended)

## “Launch” checklist

1. Choose a domain name and buy it.
2. Deploy the frontend (Netlify / Cloudflare Pages / Vercel).
3. Point your domain DNS to the host (usually set `A/AAAA` or `CNAME` records).
4. Turn on HTTPS (most hosts do this automatically).
5. If you want real order submissions, add a backend endpoint or a form provider and update `custom-boxes.html` to submit to it.

# kraft-studios-site
# kraft-studios-site
