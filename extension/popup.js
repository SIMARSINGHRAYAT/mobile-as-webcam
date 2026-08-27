// Popup script for Mobile as Webcam Chrome Extension
let currentSourceType = 'screen';
let isSharing = false;
let localStream = null;

document.addEventListener('DOMContentLoaded', () => {
  const shareBtn = document.getElementById('shareBtn');
  const stopBtn = document.getElementById('stopBtn');
  const openAppBtn = document.getElementById('openAppBtn');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const sourceBtns = document.querySelectorAll('.source-btn');

  // Source type selection
  sourceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sourceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSourceType = btn.dataset.type;
    });
  });

  // Check initial status
  checkStatus();

  // Start sharing button
  shareBtn.addEventListener('click', async () => {
    try {
      // Use getDisplayMedia API directly in popup context
      const constraints = {
        video: {
          displaySurface: currentSourceType === 'window' ? 'window' : 'monitor'
        },
        audio: false
      };

      localStream = await navigator.mediaDevices.getDisplayMedia(constraints);
      
      if (localStream) {
        isSharing = true;
        updateUI();
        
        // Handle stream stop (user clicks "Stop sharing" in browser UI)
        localStream.getVideoTracks()[0].addEventListener('ended', () => {
          isSharing = false;
          localStream = null;
          updateUI();
        });

        // Send stream to desktop app via postMessage if available
        sendStreamToDesktopApp(localStream);
      }
    } catch (error) {
      console.error('Failed to start sharing:', error);
      if (error.name !== 'NotAllowedError') {
        alert('Failed to start screen sharing: ' + error.message);
      }
    }
  });

  // Stop sharing button
  stopBtn.addEventListener('click', () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    isSharing = false;
    updateUI();
  });

  // Open desktop app button
  openAppBtn.addEventListener('click', () => {
    // Try to open the desktop app via custom protocol or direct link
    window.open('https://mobile-as-webcam.vercel.app', '_blank');
  });

  function updateUI() {
    if (isSharing) {
      shareBtn.style.display = 'none';
      stopBtn.style.display = 'flex';
      statusIndicator.className = 'status-indicator active';
      statusText.textContent = 'Sharing screen...';
    } else {
      shareBtn.style.display = 'flex';
      stopBtn.style.display = 'none';
      statusIndicator.className = 'status-indicator inactive';
      statusText.textContent = 'Not sharing';
    }
  }

  async function checkStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getCaptureStatus' });
      if (response && response.isCapturing) {
        isSharing = true;
        updateUI();
      }
    } catch (error) {
      // Background script might not be ready, that's okay
      console.log('Status check failed:', error);
    }
  }

  function sendStreamToDesktopApp(stream) {
    // This would communicate with the desktop app
    // For now, we'll just log it
    console.log('Stream ready to send to desktop app:', stream.id);
    
    // In a real implementation, you'd use Native Messaging or a local server
    // to send the stream to the Electron desktop app
    const event = new CustomEvent('streamReady', { 
      detail: { streamId: stream.id, timestamp: Date.now() } 
    });
    window.dispatchEvent(event);
  }
});
