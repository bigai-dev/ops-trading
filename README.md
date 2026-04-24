# QuoteFlow — 贸易批发报价管理系统

A modern quote, order, CRM, and inventory management app for small wholesale/trading businesses. Built as a **vibe coding workshop demo** — the entire thing runs 100% in your browser with zero backend, zero API keys, and zero setup beyond `npm install`.

Trilingual (中文 / English / Bahasa Malaysia), light + dark mode, responsive down to mobile, Excel/PDF export, and a revenue forecast chart — all with data persisted in `localStorage`.

---

## ✨ What's inside

- 📊 **Dashboard** — KPI cards, revenue trend, top clients
- 📝 **Quote Builder** — line items, discounts, tax, PDF export
- 📋 **Orders & Invoices** — status tracking, payment tracking
- 👥 **CRM** — clients, contacts, follow-up alerts
- 📦 **Inventory** — stock levels, low-stock warnings, SKU search
- 🔮 **Forecast** — simple revenue projection chart
- 🌏 **i18n** — 中文 / English / Bahasa Malaysia
- 🌗 **Dark mode** — and it actually looks good
- 📥 **Excel export** — every table, one click
- 💾 **Auto-save** — all state in `localStorage` via Zustand

**Stack:** React 19 · Vite · Tailwind CSS v4 · shadcn/ui · Zustand · Recharts · react-router · html2pdf · xlsx

---

## 🚀 Quick start (for workshop students)

You need [Node.js](https://nodejs.org) 20+ installed. Check with `node -v`.

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/demo4-quoteflow.git
cd demo4-quoteflow

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open the URL it prints (usually http://localhost:5173) and you're in.

### Other commands

```bash
npm run build     # build for production → dist/
npm run preview   # preview the production build locally
npm run lint      # run eslint
```

> **No API keys. No `.env`. No backend.** Everything is client-side. If you delete `localStorage` for the site, the app resets to the default sample data in [src/data.js](src/data.js).

---

## 📁 Project structure

```
src/
├── App.jsx                 # Entry point — just renders the layout
├── main.jsx                # React + providers (router, i18n, toast, tooltip)
├── index.css               # Tailwind v4 tokens + theme variables (light/dark)
├── data.js                 # 🟢 Default sample data (clients, inventory, quotes)
├── store.js                # 🟢 Zustand store — all app state + persistence
├── pages/
│   ├── index.jsx           # Main layout (sidebar + header + content)
│   ├── Dashboard.jsx       # KPIs, charts, recent activity
│   ├── QuoteBuilder.jsx    # Create/edit quotes → PDF
│   ├── Orders.jsx          # Quote / invoice / payment lifecycle
│   ├── CRM.jsx             # Clients list + follow-ups
│   ├── Inventory.jsx       # Stock management
│   └── Forecast.jsx        # Revenue projection
├── components/
│   ├── Sidebar.jsx         # Nav, lang switch, dark mode, export, reset
│   ├── TopBar.jsx
│   ├── KpiCard.jsx · ChartCard.jsx · SearchInput.jsx · ToastProvider.jsx
│   └── ui/                 # shadcn/ui primitives (button, card, dialog, …)
└── lib/
    ├── i18n.jsx            # 🟢 Translation strings + language provider
    ├── excel.js            # Excel export helpers (xlsx)
    ├── utils.js            # cn() helper + shared utilities
    └── hooks/              # useDarkMode, etc.
```

🟢 = the files you'll most likely want to edit first.

---

## 🤖 What to prompt Claude Code next

This app is a great starting point for practicing **vibe coding** — describing what you want in plain language and letting Claude Code do the work. Open Claude Code in this folder and try prompts like:

### 🎨 Make it yours
- *"Rebrand this from QuoteFlow to MyBusiness, change the primary color to teal, and update the logo letter."*
- *"Add a company logo upload in settings that shows on the PDF quote."*
- *"Change the default currency from RM to SGD and update the tax rate to 9% GST."*

### 🧩 Add features
- *"Add a Suppliers page with the same layout as CRM — fields: company, contact, phone, email, payment terms."*
- *"Add a 'Duplicate quote' button on each row in Orders."*
- *"Add a WhatsApp button on each client row that opens a chat with their phone number."*
- *"Let me attach a photo to each inventory item."*
- *"Add a 'Kanban' view to Orders showing Draft / Sent / Invoiced / Paid columns."*

### 📊 Improve the insights
- *"Add a 'Top 5 best-selling products this month' chart to the Dashboard."*
- *"Show profit margin per product on the Inventory page using `price - costPrice`."*
- *"Add a year-over-year comparison to the Forecast chart."*

### 🌏 Localize & polish
- *"Add a fourth language: Tamil (தமிழ்)."*
- *"Make the mobile menu slide in from the right instead of the left."*
- *"Add keyboard shortcut `N` to create a new quote from anywhere."*

### 💾 Upgrade the backend (advanced)
- *"Replace the Zustand localStorage persistence with a Supabase backend. Keep the same store API."*
- *"Add user login using Clerk so each user sees their own data."*
- *"Deploy this to Vercel and give me the URL."*

**Tip:** Claude Code works best when you tell it *what* and *why*, not *how*. Let it pick the approach, then iterate.

---

## 🛡️ Safety notes for workshop students

- This repo contains **no secrets, no API keys, no real customer data** — all data is fake sample data in [src/data.js](src/data.js).
- The `.gitignore` is set up to block `.env` files, logs, build output, and dev screenshots. If you add an API key later (e.g. for Supabase), put it in `.env.local` and **never commit it**.
- Run `git status` before every push and make sure nothing sensitive is staged.

---

## 📄 License

MIT — do whatever you want with it. Ship it, fork it, rebrand it, sell it. Have fun.
