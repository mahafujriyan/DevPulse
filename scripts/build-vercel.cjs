const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const nccOut = path.join(root, "api/ncc-bundle/index.js");
const apiEntry = path.join(root, "api/index.js");
const rootEntry = path.join(root, "index.js");

console.log("Step 1/3: Bundle with @vercel/ncc...");

execSync(
  "npx ncc build src/application.ts -o api/ncc-bundle -e bcrypt -e pg -e pg-native",
  { stdio: "inherit", cwd: root, env: process.env }
);

if (!fs.existsSync(nccOut)) {
  console.error("Build failed: api/ncc-bundle/index.js missing");
  process.exit(1);
}

console.log("Step 2/3: Write api/index.js (Express inlined — no node_modules express at runtime)...");

const bundle = fs.readFileSync(nccOut, "utf8");
const output =
  bundle +
  "\n// Vercel: export a handler function, not the Express app object.\n" +
  "// Exporting the app makes @vercel/node load node_modules/express (missing ./router).\n" +
  "const __devpulseApp = module.exports.default || module.exports;\n" +
  "module.exports = function devpulseHandler(req, res) {\n" +
  "  return __devpulseApp(req, res);\n" +
  "};\n" +
  "module.exports.config = { maxDuration: 30 };\n";

fs.writeFileSync(apiEntry, output, "utf8");

const sizeKb = Math.round(fs.statSync(apiEntry).size / 1024);
console.log(`api/index.js written (${sizeKb} KB) — Express fully inlined`);

console.log("Step 3/3: Write root index.js (Vercel Express detection only)...");

const rootWrapper = `"use strict";

// Vercel Express framework scans for require('express') in this file.
// if (false) never runs — avoids loading node_modules/express (missing ./router).
if (false) require("express");

const handler = require("./api/index.js");
module.exports = handler;
module.exports.config = handler.config || { maxDuration: 30 };
`;

fs.writeFileSync(rootEntry, rootWrapper, "utf8");
console.log("index.js written — satisfies Vercel entrypoint detection");
