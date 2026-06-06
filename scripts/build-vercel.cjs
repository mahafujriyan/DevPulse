const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const bundleDir = path.join(root, "api/ncc-bundle");
const bundleFile = path.join(bundleDir, "index.js");

console.log("Building Vercel bundle with @vercel/ncc...");

execSync(
  "npx ncc build src/application.ts -o api/ncc-bundle -e bcrypt -e pg -e pg-native",
  { stdio: "inherit", cwd: root, env: process.env }
);

if (!fs.existsSync(bundleFile)) {
  console.error("Vercel build failed: api/ncc-bundle/index.js was not created");
  process.exit(1);
}

// Root index.js satisfies Vercel Express zero-config entrypoint scan (no listen).
const rootIndex = `'use strict';
const appModule = require("./api/ncc-bundle/index.js");
const app = appModule.default || appModule;
module.exports = app;
module.exports.config = { maxDuration: 30 };
`;

fs.writeFileSync(path.join(root, "index.js"), rootIndex, "utf8");

console.log("Vercel build OK: api/ncc-bundle/index.js + root index.js");
