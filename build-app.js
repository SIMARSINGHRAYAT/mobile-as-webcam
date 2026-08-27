const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isFile()) {
      fs.copyFileSync(fromPath, toPath);
    } else {
      copyFolderSync(fromPath, toPath);
    }
  });
}

console.log("Running Next.js build...");
execSync("npm run build", { 
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: "postgres://dummy:dummy@localhost:5432/dummy" }
});

console.log("Copying static assets to standalone directory...");
copyFolderSync("public", path.join(".next", "standalone", "public"));
copyFolderSync(path.join(".next", "static"), path.join(".next", "standalone", ".next", "static"));

const standaloneNextModules = path.join(".next", "standalone", ".next", "node_modules");
if (fs.existsSync(standaloneNextModules)) {
  fs.readdirSync(standaloneNextModules)
    .filter(name => name.startsWith("pg-"))
    .forEach(name => {
      const modulePath = path.join(standaloneNextModules, name);
      if (fs.lstatSync(modulePath).isSymbolicLink()) {
        const targetPath = fs.realpathSync(modulePath);
        fs.rmSync(modulePath, { recursive: true, force: true });
        copyFolderSync(targetPath, modulePath);
      }
    });
}

console.log("Running electron-builder...");
// We use the msix target for electron-builder if available, otherwise appx
try {
  execSync("npx electron-builder --win appx", { 
    stdio: "inherit"
  });
} catch (err) {
  console.error("electron-builder failed", err);
  process.exit(1);
}
