# MOBILE as WEBCAM

Live deployment: https://mobile-as-webcam.vercel.app

## Vercel deployment

1. Import this repository into Vercel with the Next.js framework.
2. Add `DATABASE_URL` for a PostgreSQL database such as Neon, Supabase, or Vercel Postgres.
3. Run the SQL in `drizzle/0000_initial.sql` once against that database.
4. Redeploy. The `/api/pairing` and `/api/signaling` endpoints then use persistent storage.

The mobile camera page must be opened through the Vercel HTTPS URL. For phones and PCs on different networks, configure `NEXT_PUBLIC_TURN_URL`, `NEXT_PUBLIC_TURN_USERNAME`, and `NEXT_PUBLIC_TURN_PASSWORD` with a TURN provider. STUN alone is not reliable across NATs.

The desktop app currently displays the received camera stream in its own preview. Google Meet, Zoom, Teams, and OBS require a native Windows virtual-camera driver; Partner Center publication alone does not create that device.

## Use the camera in Google Meet now

OBS Studio is the supported bridge for the current build:

1. Open `MOBILE as WEBCAM` and pair the phone.
2. In OBS, add a `Window Capture` source and select the desktop app preview.
3. Crop the source to the live camera frame.
4. Click `Start Virtual Camera` in OBS.
5. In Google Meet, open camera settings and select `OBS Virtual Camera`.

The Windows app's **Start OBS Bridge** button launches OBS directly. The first time, add a Window Capture source for the app preview and save the OBS scene; later launches can reuse that scene.

This exposes the received phone video to browser applications without pretending that the Electron app is already a native Windows camera device.

## Local development

```bash
npm ci
npm run dev
```

Without `DATABASE_URL`, local development uses temporary in-memory pairing data. Production deployments should always configure PostgreSQL.