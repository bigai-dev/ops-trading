# QuoteFlow

A browser-based quote, order, CRM, and inventory app for small wholesale and trading businesses — no backend, no API keys, no setup beyond `npm install`.

QuoteFlow runs entirely in the browser with all data saved to your browser's local storage. It is built for small trading and wholesale operators who want to build quotes, track orders and payments, manage clients and stock, and export to Excel or PDF — in Chinese, English, or Bahasa Malaysia.

## Features

- **Dashboard** — KPI cards with animated counters, revenue charts, and recent activity
- **Quote Builder** — create and edit quotes with line items, then export to PDF (via html2pdf.js) with toast success notifications
- **Orders & Invoices** — track the quote-to-invoice-to-payment lifecycle and order status
- **CRM** — manage clients, contacts, and follow-ups
- **Inventory** — stock levels, low-stock warnings, and SKU search
- **Forecast** — a revenue projection chart built with Recharts
- **Trilingual (i18n)** — switch between 中文, English, and Bahasa Malaysia
- **Light and dark mode** — theme-aware charts and UI
- **Excel export** — export tables to `.xlsx` files (via the xlsx library)
- **Auto-save** — all app state persists to `localStorage` through Zustand; clearing it restores the bundled sample data
- **Responsive** — works from desktop down to mobile

## Tech Stack

- **Framework / Build:** Next.js 16 (App Router, Turbopack) + React 19
- **Language:** JavaScript (JSX)
- **Styling:** Tailwind CSS v4 with shadcn/ui components and the DM Sans / Plus Jakarta Sans fonts (loaded from Google Fonts)
- **State:** Zustand with the `persist` middleware (localStorage)
- **Navigation:** Next.js App Router — each screen has its own address, so a refresh stays on the same screen
- **Charts:** Recharts
- **Icons:** lucide-react
- **Exports:** html2pdf.js (PDF) and xlsx (Excel)

## Getting Started

### Prerequisites

- Node.js 20+ (check with `node -v`)

### Installation

```bash
npm install
```

### Environment Variables

None required. QuoteFlow is fully client-side and uses no API keys, no `.env` file, and no backend. All data lives in your browser's local storage.

### Running Locally

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

Other useful commands:

```bash
npm run build     # build for production into .next/
npm start         # serve the production build locally
npm run lint      # run ESLint
```

## Project Structure

- `app/` — Next.js routes: `layout.jsx` (page shell + metadata) and one `page.jsx` per screen — `/` (Dashboard), `/orders`, `/crm`, `/quotes` (Quote Builder), `/inventory`, `/forecast`; `not-found.jsx` sends unknown addresses back to `/`
- `src/components/AppShell.jsx` — providers (language, tooltips, toasts) + the sidebar/header layout; renders in the browser only, since all data lives in `localStorage`
- `next.config.mjs` — Next.js config
- `postcss.config.mjs` — Tailwind CSS v4 via `@tailwindcss/postcss`
- `jsconfig.json` — the `@/` path alias (points to `src/`)
- `src/components/AppShell.jsx` — language, tooltip and toast providers; renders in the browser only, since all data lives in local storage
- `src/index.css` — Tailwind v4 tokens and light/dark theme variables
- `src/data.js` — default sample data (clients, inventory, quotes)
- `src/store.js` — Zustand store holding all app state and persistence
- `src/screens/` — the main screens (Dashboard, QuoteBuilder, Orders, CRM, Inventory, Forecast) and `index.jsx` with the sidebar + header layout
- `src/components/` — shared components, plus `ui/` shadcn/ui primitives
- `src/lib/` — i18n strings, Excel export helpers, utilities, and custom hooks (dark mode, chart theme, count-up)

## Notes

This project was built as a demo for a vibe coding workshop. It ships with fake sample data only — no secrets, no API keys, and no real customer information. The `.gitignore` blocks `.env` files, logs, build output, and dev screenshots. If you later add a service such as a database, keep its keys in `.env.local` and never commit them.

Licensed under MIT.
