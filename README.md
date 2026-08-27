# MOBILE as WEBCAM - Pure Web Application

Turn your smartphone into a high-quality wireless webcam for your computer using just a web browser. No desktop app installation required!

## 🎯 Features

- **Zero Installation** - Works entirely in your browser
- **WebRTC Streaming** - Low-latency peer-to-peer video
- **QR Code Pairing** - Instant connection between devices
- **HD Quality** - Up to 1080p camera support
- **Cross-Platform** - Works on any device with a modern browser
- **Free & Open Source** - Deploy anywhere (Vercel, Netlify, etc.)

## 🚀 Quick Start

### For Video Calls (Google Meet, Zoom, Teams)

1. **Deploy the App**
   ```bash
   # Clone and install
   git clone <your-repo-url>
   cd mobile-as-webcam
   npm install
   
   # Run locally
   npm run dev
   
   # Or deploy to Vercel
   vercel deploy
   ```

2. **On Your Computer**
   - Visit your deployed URL (e.g., `https://your-app.vercel.app`)
   - Click "Get Started" → "Continue to App"
   - Click "Generate Pairing Code"
   - Keep this page open

3. **On Your Phone**
   - Scan the QR code with your phone's camera
   - OR visit the URL shown on desktop
   - Enter the 6-digit device code
   - Tap "Start Camera Stream"
   - Grant camera permissions when prompted

4. **In Your Video Call**
   
   **Option A: Using OBS Studio (Recommended)**
   - Download OBS Studio: https://obsproject.com
   - Add "Window Capture" source → Select your browser window showing the phone feed
   - Click "Start Virtual Camera" in OBS controls
   - In Google Meet/Zoom/Teams: Select "OBS Virtual Camera" as your camera
   
   **Option B: Using Chrome Extension**
   - Load the extension from `/extension` folder
   - Click extension icon → Start Sharing
   - Select the browser window with phone feed
   - The screen appears as a virtual camera via OBS
   
   **Option C: Screen Share Directly**
   - In Google Meet/Zoom: Share screen → Select the browser tab with phone feed
   - Participants will see your phone camera feed

## 🔧 How It Works

```
┌─────────────┐                    ┌──────────────┐                    ┌─────────────┐
│   Desktop   │◄──── Signaling ───►│    Vercel    │◄──── Signaling ───►│    Mobile   │
│   Browser   │     API (HTTP)     │  Next.js App │     API (HTTP)     │   Browser   │
│             │                    │              │                    │             │
│  WebRTC     │◄─────── P2P ──────►│              │◄─────── P2P ──────►│   WebRTC    │
│  Peer Conn  │     Video Stream   │              │     Video Stream   │   Camera    │
└─────────────┘                    └──────────────┘                    └─────────────┘
       │                                                                       
       │ Display phone feed                                                   
       ▼                                                                       
┌─────────────┐                                                              
│ OBS Studio  │  (Optional: For virtual camera)                              
│ Window Cap  │                                                              
└─────────────┘                                                              
       │                                                                      
       │ Virtual Camera Output                                                
       ▼                                                                      
┌─────────────┐                                                              
│ Google Meet │                                                              
│ Zoom        │                                                              
│ Teams       │                                                              
└─────────────┘                                                              
```

## 📁 Project Structure

```
mobile-as-webcam/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── pairing/      # Session creation & management
│   │   │   ├── signaling/    # WebRTC signaling messages
│   │   │   └── turn/         # STUN/TURN server config
│   │   ├── mobile/           # Mobile camera interface
│   │   ├── page.tsx          # Desktop main page
│   │   └── layout.tsx        # Root layout
│   └── components/
│       ├── WelcomePage.tsx   # Landing page
│       ├── HowToUsePage.tsx  # Instructions
│       └── MainDesktopApp.tsx # Main desktop UI
├── extension/                # Chrome extension for screen capture
├── package.json
└── README.md
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Video**: WebRTC (peer-to-peer streaming)
- **Signaling**: HTTP polling API (Next.js API Routes)
- **Deployment**: Vercel (serverless functions)
- **Icons**: Lucide React

## ⚠️ Important Limitations

### Why You Need OBS or Similar Software

**Browser websites cannot create virtual camera devices directly** due to security restrictions. Websites run in a sandboxed environment and cannot:
- Install kernel-level drivers
- Create DirectShow devices
- Access system-level camera interfaces

**Solutions:**

1. **OBS Studio** (Free, Recommended)
   - Captures browser window showing phone feed
   - Creates virtual camera output
   - Works with all video conferencing apps
   - Download: https://obsproject.com

2. **Unity Capture** (Third-party driver)
   - Native Windows virtual camera driver
   - Requires separate installation
   - GitHub: https://github.com/schellingb/UnityCapture

3. **Chrome Extension** (Included)
   - Screen capture to existing virtual camera
   - See `/extension` folder
   - Requires virtual camera software running

## 🌐 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Deploy (no environment variables needed for basic setup)

### Environment Variables (Optional)

For production TURN servers (better connectivity across networks):

```env
NEXT_PUBLIC_TURN_URL=turn:your-turn-server.com:3478
NEXT_PUBLIC_TURN_USERNAME=your-username
NEXT_PUBLIC_TURN_PASSWORD=your-password
```

## 🔒 Privacy & Security

- **Peer-to-Peer**: Video streams directly between devices (not through servers)
- **Signaling Only**: Servers only handle connection metadata
- **No Recording**: No video is stored or recorded
- **HTTPS Required**: Camera access requires secure context
- **Session Expiry**: Pairing sessions expire after 5 minutes

## 🐛 Troubleshooting

### Camera Not Working on Mobile
- Ensure you're using HTTPS (required for camera access)
- Try Chrome or Safari mobile browsers
- Check camera permissions in browser settings
- Close other apps using the camera

### Connection Issues
- Both devices must be on the same network for best results
- If behind NAT/firewall, configure TURN servers
- Refresh both pages and try again
- Check browser console for errors

### Video Not Appearing in Video Calls
- Make sure OBS Virtual Camera is started
- Select "OBS Virtual Camera" in your video call settings
- Ensure OBS is capturing the correct browser window
- Try restarting OBS and the browser

## 📝 License

MIT License - Free to use, modify, and distribute

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- WebSocket signaling for lower latency
- Better mobile UI/UX
- Additional camera controls (zoom, exposure)
- Multi-device support
- Audio streaming from mobile

---

**Made with ❤️ using Next.js and WebRTC**
