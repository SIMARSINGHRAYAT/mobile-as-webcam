# Mobile as Webcam - Chrome Extension

This Chrome extension allows you to share your screen or application windows directly with the Mobile as Webcam desktop application, which then broadcasts it as a virtual camera to video conferencing apps like Google Meet, Zoom, Microsoft Teams, and more.

## Installation

### Option 1: Load Unpacked (Development)
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select this `extension` folder
5. The extension icon should appear in your toolbar

### Option 2: Install from Chrome Web Store (Production)
1. Package the extension using Chrome's packaging tool
2. Submit to Chrome Web Store for review
3. Once approved, users can install directly from the store

## Usage

1. **Install the Unity Capture Virtual Camera Driver** (via the desktop app)
   - This creates a native Windows camera device
   - Works with all video conferencing applications

2. **Click the extension icon** in your Chrome toolbar

3. **Select source type**:
   - Full Screen: Share your entire display
   - Window: Share a specific application window

4. **Click "Start Sharing"** and select the screen/window you want to share

5. **Open the Mobile as Webcam desktop app**

6. **In your video conferencing app** (Google Meet, Zoom, Teams):
   - Go to video/camera settings
   - Select "Unity Capture" as your camera
   - Your shared screen will appear as a camera feed

## Features

- ✅ Manifest V3 compatible
- ✅ Screen sharing with full HD support (1920x1080 @ 30fps)
- ✅ Window-specific sharing
- ✅ Real-time preview
- ✅ One-click start/stop
- ✅ Works with Google Meet, Zoom, Microsoft Teams, Skype, Discord
- ✅ No additional software needed beyond the desktop app

## How It Works

1. The extension uses Chrome's `getDisplayMedia` API to capture your screen
2. The captured stream is sent to the Mobile as Webcam desktop application
3. The desktop app processes the stream and sends it to the Unity Capture virtual camera driver
4. Video conferencing apps see "Unity Capture" as a physical camera device
5. Your screen content appears in the video call just like a webcam feed

## Permissions Explained

- `desktopCapture`: Required to capture your screen or application windows
- `tabs`: Used to manage extension behavior across browser tabs
- `activeTab`: Access the current tab when the extension is activated

## Troubleshooting

### Extension doesn't appear in toolbar
- Click the puzzle piece icon in Chrome's toolbar
- Pin the "Mobile as Webcam" extension

### Screen sharing doesn't start
- Make sure you granted screen sharing permission when prompted
- Check that no other app is exclusively using the screen

### Virtual camera not showing in video apps
- Ensure Unity Capture driver is installed (via desktop app)
- Restart the video conferencing application
- Try restarting your computer after driver installation

### Poor video quality
- Close unnecessary applications to free up system resources
- Reduce the resolution of your shared screen
- Check your internet connection if streaming remotely

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Background Script**: Service Worker (Manifest V3 requirement)
- **Screen Capture**: Uses native `navigator.mediaDevices.getDisplayMedia` API
- **Virtual Camera**: Unity Capture DirectShow filter
- **Supported OS**: Windows 10/11 (64-bit)

## Development

To modify the extension:

1. Edit the source files in this folder
2. Go to `chrome://extensions/` in Chrome
3. Click the refresh icon on the Mobile as Webcam extension card
4. Test your changes

## License

MIT License - See main project repository for details

## Support

For issues or feature requests, please visit the main project repository on GitHub.
