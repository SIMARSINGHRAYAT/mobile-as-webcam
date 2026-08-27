# MOBILE as WEBCAM

## Vercel deployment

1. Import this repository into Vercel with the Next.js framework.
2. Add `DATABASE_URL` for a PostgreSQL database such as Neon, Supabase, or Vercel Postgres.
3. Run the SQL in `drizzle/0000_initial.sql` once against that database.
4. Redeploy. The `/api/pairing` and `/api/signaling` endpoints then use persistent storage.

The mobile camera page must be opened through the Vercel HTTPS URL. For phones and PCs on different networks, configure `NEXT_PUBLIC_TURN_URL`, `NEXT_PUBLIC_TURN_USERNAME`, and `NEXT_PUBLIC_TURN_PASSWORD` with a TURN provider. STUN alone is not reliable across NATs.

## Local development

```bash
npm ci
npm run dev
```

Without `DATABASE_URL`, local development uses temporary in-memory pairing data. Production deployments should always configure PostgreSQL.