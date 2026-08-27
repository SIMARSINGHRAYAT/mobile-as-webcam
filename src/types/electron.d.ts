export interface MobileAsWebcamAPI {
  launchObs: () => Promise<{ success: boolean; error?: string }>;
  installVirtualCamera: () => Promise<{ success: boolean; error?: string; message?: string }>;
  checkVirtualCamera: () => Promise<{ installed: boolean }>;
  launchVirtualCameraApp: () => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    mobileAsWebcam?: MobileAsWebcamAPI;
  }
}

export {};
