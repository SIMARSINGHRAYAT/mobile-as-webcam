// Background service worker for Mobile as Webcam Chrome Extension
let captureStream = null;
let connectedPorts = [];

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Mobile as Webcam extension installed', details.reason);
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startCapture') {
    startScreenCapture(message.sourceType)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'stopCapture') {
    stopScreenCapture();
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === 'getCaptureStatus') {
    sendResponse({ 
      isCapturing: captureStream !== null,
      streamActive: captureStream?.active || false 
    });
    return true;
  }
  
  if (message.action === 'getSources') {
    getAvailableSources()
      .then((sources) => sendResponse({ success: true, sources }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function startScreenCapture(sourceType = 'screen') {
  try {
    // Stop existing capture if any
    if (captureStream) {
      stopScreenCapture();
    }

    const sources = await getAvailableSources();
    
    // For now, we'll use chrome.desktopCapture API directly
    // The user will select the source from the browser's native picker
    const streamId = await new Promise((resolve, reject) => {
      chrome.desktopCapture.chooseDesktopMedia(
        [sourceType === 'window' ? 'window' : 'screen'],
        (streamId) => {
          if (!streamId) {
            reject(new Error('User cancelled source selection'));
          } else {
            resolve(streamId);
          }
        }
      );
    });

    // Note: In Manifest V3, we can't directly get the stream in background script
    // We need to pass the streamId to the capture page or popup
    return { 
      success: true, 
      streamId,
      message: 'Source selected. Use the streamId to get the actual media stream.'
    };
  } catch (error) {
    console.error('Failed to start capture:', error);
    return { success: false, error: error.message };
  }
}

function stopScreenCapture() {
  if (captureStream) {
    captureStream.getTracks().forEach(track => track.stop());
    captureStream = null;
  }
}

async function getAvailableSources() {
  return new Promise((resolve) => {
    chrome.desktopCapture.chooseDesktopMedia(
      ['screen', 'window'],
      (streamId) => {
        // This just triggers the picker, we don't actually start capturing here
        // The actual capture happens in the capture.html page
        resolve([]);
      }
    );
  });
}

// Clean up on extension unload
chrome.runtime.onSuspend.addListener(() => {
  stopScreenCapture();
});
