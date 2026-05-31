const fs = require("node:fs");
const path = require("node:path");

const projectRoot = process.cwd();
const routerRoot = path.join(projectRoot, "node_modules", "expo-router");

const files = [
  "_ctx.android.js",
  "_ctx.ios.js",
  "_ctx.web.js",
  "_ctx.js"
];

let touched = 0;

for (const fileName of files) {
  const filePath = path.join(routerRoot, fileName);

  if (!fs.existsSync(filePath)) {
    continue;
  }

  const before = fs.readFileSync(filePath, "utf8");

  let after = before
    .replaceAll("process.env.EXPO_ROUTER_APP_ROOT", JSON.stringify("../../app"))
    .replaceAll("process.env.EXPO_ROUTER_IMPORT_MODE", JSON.stringify("sync"));

  if (after !== before) {
    fs.writeFileSync(filePath, after);
    touched += 1;
    console.log("✓ patched", path.relative(projectRoot, filePath));
  } else {
    console.log("↳ ok", path.relative(projectRoot, filePath));
  }
}

if (touched === 0) {
  console.log("⚠ nenhum arquivo _ctx precisou de patch.");
}

console.log("Expo Router context patch finalizado.");
