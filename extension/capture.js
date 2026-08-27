// Capture page script for Mobile as Webcam Chrome Extension
let localStream = null;
const videoElement = document.getElementById('preview');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusElement = document.getElementById('status');

startBtn.addEventListener('click', async () => {
  try {
    // Request screen sharing permission
    localStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      },
      audio: false
    });

    if (localStream) {
      videoElement.srcObject = localStream;
      startBtn.style.display = 'none';
      stopBtn.style.display = 'inline-block';
      statusElement.textContent = '✓ Capturing screen - Ready to send to desktop app';
      
      // Handle when user stops sharing via browser UI
      localStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopCapture();
      });

      // Notify background script that capture has started
      chrome.runtime.sendMessage({ 
        action: 'captureStarted',
        streamId: localStream.id 
      });
    }
  } catch (error) {
    console.error('Failed to start capture:', error);
    statusElement.textContent = '✗ Failed to start capture: ' + error.message;
  }
});

stopBtn.addEventListener('click', () => {
  stopCapture();
});

function stopCapture() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  
  if (videoElement) {
    videoElement.srcObject = null;
  }
  
  startBtn.style.display = 'inline-block';
  stopBtn.style.display = 'none';
  statusElement.textContent = 'Ready to capture';
  
  // Notify background script that capture has stopped
  chrome.runtime.sendMessage({ action: 'captureStopped' });
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startCapture') {
    startBtn.click();
    sendResponse({ success: true });
  } else if (message.action === 'stopCapture') {
    stopCapture();
    sendResponse({ success: true });
  } else if (message.action === 'getStatus') {
    sendResponse({ 
      isCapturing: localStream !== null,
      streamActive: localStream?.active || false 
    });
  }
  return true;
});

// Auto-start capture if opened with specific URL parameter
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('autoStart') === 'true') {
  startBtn.click();
}
