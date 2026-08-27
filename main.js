const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const dgram = require("dgram");
const { spawn } = require("child_process");
const http = require("http");

let mainWindow;
let nextServerProcess;
const PORT = 3000; // You can dynamically find a free port if preferred
const DEPLOYED_APP_URL = "https://mobile-as-webcam.vercel.app";

function findObsPath() {
  const candidates = [
    "C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe",
    "C:\\Program Files (x86)\\obs-studio\\bin\\64bit\\obs64.exe",
  ];
  return candidates.find((candidate) => require("fs").existsSync(candidate));
}

ipcMain.handle("launch-obs", async () => {
  const obsPath = findObsPath();
  if (!obsPath) return { success: false, error: "OBS Studio is not installed." };
  const { execFile } = require("child_process");
  execFile(obsPath, [], { cwd: path.dirname(obsPath), windowsHide: false }, (error) => {
    if (error) console.error("Failed to launch OBS Studio", error);
  });
  return { success: true };
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
