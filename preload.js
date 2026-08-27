const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mobileAsWebcam", {
  launchObs: () => ipcRenderer.invoke("launch-obs"),
});