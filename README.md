# 🛡️ ZuupValidate

A free, open-source tool for authenticating **Zuup certificates** — built with React, TanStack Start, Supabase, and Cloudflare Workers.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ZuupValidate lets anyone instantly verify whether a Zuup certificate is genuine — by entering its code or scanning its QR code. On the admin side, **Mailmerge Studio** lets organizers design a certificate template once and bulk-generate thousands of unique, verifiable certificates from a CSV file.

## ✨ Features

- 🔍 **Instant verification** — Enter a certificate code (e.g. `ZUP-A1B2C3`) or scan its QR code to confirm authenticity in seconds, with zero setup.
- 📷 **Camera QR scanning** — Verify directly from any smartphone or webcam using the built-in QR scanner.
- 🎨 **Mailmerge Studio** — A visual certificate builder: upload a template, then drag dynamic text blocks, QR codes, and certificate numbers onto a canvas and position them exactly where you want.
- 📊 **CSV to bulk PDFs** — Map columns from any CSV to your template and automatically generate thousands of unique, verified certificate PDFs.
- 🔐 **Verifiable records** — Every certificate is registered in a Supabase database with PostgreSQL row-level security, so each one stays instantly scannable and permanently verifiable.
- 🆓 **Free & open source** — Built for students, organizers, and anyone who needs verifiable proof.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + [TanStack Start](https://tanstack.com/start) / [TanStack Router](https://tanstack.com/router) |
| Build Tool | Vite |
| UI | shadcn/ui + Tailwind CSS |
| Database | Supabase (PostgreSQL with Row-Level Security) |
| QR Codes | `html5-qrcode` (scanning) · `qrcode` (generation) |
| Documents | `jsPDF` (PDF export) · `PapaParse` (CSV parsing) |
| Deployment | Cloudflare Workers (Wrangler) |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (the repo also includes a `bun.lock`, so [Bun](https://bun.sh/) works too)
- A [Supabase](https://supabase.com/) project
- A [Cloudflare](https://www.cloudflare.com/) account (for deployment)

### 1. Clone the repo

```bash
git clone https://github.com/Jagrit0711/validate.git
cd validate
npm install
```

### 2. Set up the database

Run the SQL in `supabase-setup.sql` from your Supabase project's SQL editor to create the `validate` table and its security policies.

### 3. Configure your Supabase connection

The Supabase project URL and anon key are set in `src/lib/supabase.ts`, and the admin email is defined there as well. Update these to point to your own Supabase project.

### 4. Run locally

```bash
npm run dev
```

This starts the Vite dev server for local development.

### 5. Deploy

Deploy to Cloudflare Workers with Wrangler:

```bash
npx wrangler deploy
```

## 📖 Usage

### Verifying a certificate

1. Open the homepage.
2. Either:
   - **Enter the certificate code** (e.g. `ZUP-A1B2C3`) and click **Verify**, or
   - Click **Scan QR Code** and point your camera at the certificate's QR code.
3. You'll land on `/v/<code>`, which shows the certificate's details — who it was issued to, their email, what it was issued for, and the issue date — if it's authentic, or a **Not Found** message if the code doesn't match any record.

### Generating certificates (Admin)

1. Go to the **Admin Dashboard** (`/admin`) and sign in.
2. Open **Mailmerge Studio**, upload your certificate template, and place dynamic fields and the verification QR code on the canvas.
3. Upload a CSV of recipients and map the columns to your template fields.
4. Generate the certificates — each one is registered in the database with a unique, verifiable code.

## 🤝 Contributing

This project is open source and contributions are welcome!

1. Fork the repo
2. Create your branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

## 📄 License

MIT © Jagrit & Zuup Community
