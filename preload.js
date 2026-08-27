const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mobileAsWebcam", {
  launchObs: () => ipcRenderer.invoke("launch-obs"),
  installVirtualCamera: () => ipcRenderer.invoke("install-virtual-camera"),
  checkVirtualCamera: () => ipcRenderer.invoke("check-virtual-camera"),
  launchVirtualCameraApp: () => ipcRenderer.invoke("launch-virtual-camera-app"),
});