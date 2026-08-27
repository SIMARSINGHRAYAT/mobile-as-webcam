# MOBILE as WEBCAM

Live deployment: https://mobile-as-webcam.vercel.app

**Turn your smartphone into a high-quality wireless webcam for Windows PC with native virtual camera support!**

## ✨ New Features

- 🎥 **Native Windows Virtual Camera**: Unity Capture driver integration - works directly with Google Meet, Zoom, Teams without OBS!
- 🔌 **Chrome Extension**: Share your screen/window directly to video conferencing apps via the virtual camera
- 📱 **Mobile WebRTC Streaming**: High-quality, low-latency video from your phone's camera
- 💻 **Desktop App**: Electron-based Windows application with modern UI

## Quick Start

### For Video Conferencing (Google Meet, Zoom, Teams)

1. **Install the Desktop App** (Windows)
   - Download and run the Electron app
   - Install the Unity Capture virtual camera driver (one-click from the app)
   - Restart the app after installation

2. **Connect Your Phone**
   - Open the app and go to "Connect Device" tab
   - Scan QR code or enter pairing code on your phone
   - Visit the HTTPS URL on your mobile browser

3. **Use in Video Calls**
   - In Google Meet/Zoom/Teams, open video settings
   - Select **"Unity Capture"** as your camera
   - Your phone camera now appears as a webcam!

### Chrome Extension (Screen Sharing)

1. **Load the Extension**
   - Open Chrome → `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" → select the `extension` folder

2. **Share Your Screen**
   - Click the extension icon
   - Choose "Full Screen" or "Window"
   - Click "Start Sharing"
   - Your screen appears in the Unity Capture virtual camera!

3. **Use in Video Apps**
   - Select "Unity Capture" camera in your video conferencing app
   - Your shared screen is now visible to all participants

## Vercel Deployment

1. Import this repository into Vercel with the Next.js framework
2. Add `DATABASE_URL` for PostgreSQL (Neon, Supabase, or Vercel Postgres)
3. Run the SQL in `drizzle/0000_initial.sql` against your database
4. Redeploy - API endpoints now use persistent storage

**Important**: Mobile camera requires HTTPS. The Vercel deployment provides this automatically.

**For cross-network connectivity** (phone on cellular, PC on home WiFi):
- Configure `NEXT_PUBLIC_TURN_URL`, `NEXT_PUBLIC_TURN_USERNAME`, `NEXT_PUBLIC_TURN_PASSWORD`
- Use a TURN provider like Twilio, Xirsys, or coturn server

## Architecture

```
┌─────────────┐     WebRTC      ┌──────────────┐     USB/WiFi    ┌──────────────┐
│  Mobile     │◄───────────────►│  Vercel      │◄───────────────►│  Desktop App │
│  Browser    │  Signaling API  │  (Next.js)   │  Polling        │  (Electron)  │
│  (Camera)   │                 │              │                 │              │
└─────────────┘                 └──────────────┘                 └──────┬───────┘
                                                                        │
                                                                        │ Virtual Camera
                                                                        ▼
                                                             ┌──────────────┐
                                                             │ Unity Capture│
                                                             │ Driver       │
                                                             └──────┬───────┘
                                                                    │
                    ┌───────────────────────────────────────────────┼───────────────────────────────────┐
                    │                                               │                                   │
                    ▼                                               ▼                                   ▼
          ┌─────────────────┐                            ┌─────────────────┐                 ┌─────────────────┐
          │  Google Meet    │                            │  Zoom           │                 │  Microsoft Teams│
          │  (Select Unity  │                            │  (Select Unity  │                 │  (Select Unity  │
          │   Capture)      │                            │   Capture)      │                 │   Capture)      │
          └─────────────────┘                            └─────────────────┘                 └─────────────────┘
```

## Components

### Desktop App (Electron)
- Windows-native application with modern UI
- Unity Capture driver download & installation
- Virtual camera configuration tools
- Real-time video preview
- WebRTC peer connection management

### Chrome Extension
- Manifest V3 compatible
- Screen/window capture via `getDisplayMedia` API
- Integration with desktop app
- Works with all video conferencing platforms

### Mobile Interface
- Responsive web app (PWA-ready)
- Camera selection (front/back)
- Quality controls
- Connection status monitoring

### Backend (Vercel + PostgreSQL)
- Pairing session management
- WebRTC signaling (SDP exchange)
- Device registration
- Persistent storage with Drizzle ORM

## Local Development

```bash
npm ci
npm run dev
```

Without `DATABASE_URL`, local development uses in-memory pairing data. For production-like testing, configure a PostgreSQL database.

## Chrome Extension Installation

### Development Mode
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `extension` folder from this repository
5. Extension icon appears in toolbar

### Production (Chrome Web Store)
1. Package the extension:
   - Go to `chrome://extensions/`
   - Click "Pack extension"
   - Select the `extension` folder
   - Generate `.crx` file
2. Submit to Chrome Web Store
3. Users install from store

## Troubleshooting

### Virtual Camera Not Showing
- Ensure Unity Capture driver is installed (check in Desktop App)
- Restart your computer after driver installation
- Check Device Manager → Imaging Devices for "Unity Capture"

### Extension Not Working
- Make sure extension is enabled in `chrome://extensions/`
- Grant screen recording permissions when prompted
- Try reloading the extension

### Connection Issues (Phone ↔ PC)
- Both devices must be on same network OR configure TURN server
- Firewall may block WebRTC - allow UDP ports
- Use HTTPS URL for mobile (required for camera access)

### Poor Video Quality
- Check network bandwidth
- Reduce resolution in mobile camera settings
- Close other bandwidth-intensive applications

## Technology Stack

- **Frontend**: Next.js 16, React, TypeScript, TailwindCSS
- **Desktop**: Electron, IPC
- **Mobile**: WebRTC, getUserMedia API
- **Backend**: Next.js API Routes, Serverless Functions
- **Database**: PostgreSQL, Drizzle ORM
- **Virtual Camera**: Unity Capture (DirectShow filter)
- **Extension**: Chrome Manifest V3

## Limitations & Solutions

| Limitation | Solution |
|------------|----------|
| No native Windows camera driver | ✅ Unity Capture third-party driver (installed via app) |
| HTTP polling for signaling | Works reliably; WebSocket upgrade possible in future |
| HTTPS required for mobile camera | ✅ Provided by Vercel deployment |
| Cross-NAT connectivity | ✅ Configurable TURN server support |
| OBS dependency | ✅ Eliminated with Unity Capture driver |

## Security

- WebRTC encryption (DTLS-SRTP)
- Secure pairing codes (time-limited)
- HTTPS enforcement for camera access
- No video data stored on server (peer-to-peer streaming)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (desktop + mobile + extension)
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ for remote workers, content creators, and anyone who needs a better webcam solution!**