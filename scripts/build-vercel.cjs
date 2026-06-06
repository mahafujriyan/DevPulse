const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const nccOut = path.join(root, "api/ncc-bundle/index.js");
const apiEntry = path.join(root, "api/index.js");

console.log("Step 1/2: Bundle with @vercel/ncc...");

execSync(
  "npx ncc build src/application.ts -o api/ncc-bundle -e bcrypt -e pg -e pg-native",
  { stdio: "inherit", cwd: root, env: process.env }
);

if (!fs.existsSync(nccOut)) {
  console.error("Build failed: api/ncc-bundle/index.js missing");
  process.exit(1);
}

console.log("Step 2/2: Write single api/index.js (no secondary files for Vercel to trace)...");

const bundle = fs.readFileSync(nccOut, "utf8");
const output =
  bundle +
  "\n// Vercel serverless config\n" +
  "module.exports.config = { maxDuration: 30 };\n";

fs.writeFileSync(apiEntry, output, "utf8");

const sizeKb = Math.round(fs.statSync(apiEntry).size / 1024);
console.log(`api/index.js written (${sizeKb} KB) — Express fully inlined`);
