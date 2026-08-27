const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const dgram = require("dgram");
const { spawn, execFile } = require("child_process");
const http = require("http");
const fs = require("fs");
const https = require("https");
const { pipeline } = require("stream");
const { promisify } = require("util");

const streamPipeline = promisify(pipeline);

let mainWindow;
let nextServerProcess;
let virtualCameraProcess;
const PORT = 3000;
const DEPLOYED_APP_URL = "https://mobile-as-webcam.vercel.app";
const UNITY_CAPTURE_URL = "https://github.com/schellingb/UnityCapture/releases/download/v1.2.1/UnityCaptureInstall.exe";
const VIRTUAL_CAMERA_DIR = path.join(app.getPath("userData"), "VirtualCameraDriver");

function findObsPath() {
  const candidates = [
    "C:\\\\Program Files\\\\obs-studio\\\\bin\\\\64bit\\\\obs64.exe",
    "C:\\\\Program Files (x86)\\\\obs-studio\\\\bin\\\\64bit\\\\obs64.exe",
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function downloadVirtualCameraDriver() {
  if (!fs.existsSync(VIRTUAL_CAMERA_DIR)) {
    fs.mkdirSync(VIRTUAL_CAMERA_DIR, { recursive: true });
  }
  
  const installerPath = path.join(VIRTUAL_CAMERA_DIR, "UnityCaptureInstall.exe");
  
  if (fs.existsSync(installerPath)) {
    return installerPath;
  }
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(installerPath);
    https.get(UNITY_CAPTURE_URL, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve(installerPath);
          });
        }).on("error", (err) => {
          fs.unlink(installerPath, () => {});
          reject(err);
        });
      } else {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(installerPath);
        });
      }
    }).on("error", (err) => {
      fs.unlink(installerPath, () => {});
      reject(err);
    });
  });
}

async function installVirtualCameraDriver() {
  try {
    const installerPath = await downloadVirtualCameraDriver();
    
    return new Promise((resolve) => {
      execFile(
        installerPath,
        ["/S"],
        { windowsHide: true },
        (error) => {
          if (error) {
            resolve({ success: false, error: "Failed to install virtual camera driver. Please run as administrator." });
          } else {
            resolve({ success: true, message: "Virtual camera driver installed successfully." });
          }
        }
      );
    });
  } catch (err) {
    return { success: false, error: `Download failed: ${err.message}` };
  }
}

function isVirtualCameraInstalled() {
  const registryPaths = [
    "HKEY_LOCAL_MACHINE\\\\SOFTWARE\\\\UnityCapture",
    "C:\\\\Program Files\\\\UnityCapture",
    "C:\\\\Program Files (x86)\\\\UnityCapture",
  ];
  
  for (const regPath of registryPaths) {
    if (regPath.startsWith("HKEY")) {
      try {
        const { execSync } = require("child_process");
        execSync(`reg query "${regPath}"`, { stdio: "ignore" });
        return true;
      } catch {
        continue;
      }
    } else if (fs.existsSync(regPath)) {
      return true;
    }
  }
  
  return false;
}

ipcMain.handle("launch-obs", async () => {
  const obsPath = findObsPath();
  if (!obsPath) return { success: false, error: "OBS Studio is not installed." };
  execFile(obsPath, [], { cwd: path.dirname(obsPath), windowsHide: false }, (error) => {
    if (error) console.error("Failed to launch OBS Studio", error);
  });
  return { success: true };
});

ipcMain.handle("install-virtual-camera", async () => {
  return await installVirtualCameraDriver();
});

ipcMain.handle("check-virtual-camera", async () => {
  return { installed: isVirtualCameraInstalled() };
});

ipcMain.handle("launch-virtual-camera-app", async () => {
  const appPaths = [
    "C:\\\\Program Files\\\\UnityCapture\\\\UnityCaptureFilterConfig.exe",
    "C:\\\\Program Files (x86)\\\\UnityCapture\\\\UnityCaptureFilterConfig.exe",
  ];
  
  for (const appPath of appPaths) {
    if (fs.existsSync(appPath)) {
      execFile(appPath, [], { windowsHide: false }, (error) => {
        if (error) console.error("Failed to launch Virtual Camera Config", error);
      });
      return { success: true };
    }
  }
  
  return { success: false, error: "Virtual Camera configuration tool not found." };
});

function getLanAddress() {
  return new Promise((resolve) => {
    const socket = dgram.createSocket("udp4");
    socket.once("error", () => {
      socket.close();
      resolve(getFallbackLanAddress());
    });
    socket.connect(80, "8.8.8.8", () => {
      const address = socket.address().address;
      socket.close();
      resolve(address);
    });
  });
}

function getFallbackLanAddress() {
  const interfaces = os.networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) return entry.address;
    }
  }
  return "localhost";
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(app.isPackaged ? DEPLOYED_APP_URL : `http://127.0.0.1:${PORT}`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

async function startNextServer() {
  const isDev = !app.isPackaged;
  if (!isDev) {
    createWindow();
    return;
  }
  const publicHost = await getLanAddress();
  
  if (isDev) {
    const nextCliPath = require.resolve("next/dist/bin/next");
    nextServerProcess = spawn(process.execPath, [nextCliPath, "dev"], {
      cwd: __dirname,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        PORT: PORT.toString(),
        HOSTNAME: "0.0.0.0",
        PUBLIC_HOST: publicHost,
      },
      stdio: "inherit",
      windowsHide: true,
    });

    nextServerProcess.on("error", (err) => {
      console.error("Failed to start Next.js development server", err);
    });

    checkServerAndLoad(PORT, () => createWindow());
    return;
  }

  // In production, start the standalone server
  // Standalone server requires the public and .next/static folders to be available
  const standalonePath = path.join(__dirname, ".next", "standalone");
  const serverPath = path.join(standalonePath, "server.js");
  
  // Set working directory to the standalone directory so the server finds the right paths
  const cwd = standalonePath;
  
  process.env.PORT = PORT.toString();
  process.env.HOSTNAME = "0.0.0.0";
  process.env.PUBLIC_HOST = publicHost;
  process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://dummy:dummy@localhost:5432/dummy";
  process.chdir(cwd);

  try {
    require(serverPath);
  } catch (err) {
    console.error("Failed to start Next.js server", err);
    return;
  }

  checkServerAndLoad(PORT, () => createWindow());
}

function checkServerAndLoad(port, cb, retries = 20) {
  const req = http.get(`http://127.0.0.1:${port}`, (res) => {
    if (res.statusCode === 200 || res.statusCode === 304 || res.statusCode === 404) {
      // If it responds with anything, the server is up
      cb();
    } else {
      setTimeout(() => checkServerAndLoad(port, cb, retries - 1), 500);
    }
  });
  
  req.on("error", () => {
    if (retries > 0) {
      setTimeout(() => checkServerAndLoad(port, cb, retries - 1), 500);
    } else {
      console.error("Next.js server not reachable.");
    }
  });
  req.end();
}

app.on("ready", startNextServer);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  if (nextServerProcess && typeof nextServerProcess.kill === "function") {
    nextServerProcess.kill();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
