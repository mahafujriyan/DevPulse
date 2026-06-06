const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const nccOut = path.join(root, "api/ncc-bundle/index.js");
const distDir = path.join(root, "dist");
const bundleOut = path.join(distDir, "vercel-app.js");

console.log("Step 1/2: Bundle with @vercel/ncc...");

execSync(
  "npx ncc build src/application.ts -o api/ncc-bundle -e bcrypt -e pg -e pg-native",
  { stdio: "inherit", cwd: root, env: process.env }
);

if (!fs.existsSync(nccOut)) {
  console.error("Build failed: api/ncc-bundle/index.js missing");
  process.exit(1);
}

console.log("Step 2/2: Write dist/vercel-app.js (single file, no api/ route conflict)...");

fs.mkdirSync(distDir, { recursive: true });

const bundle = fs.readFileSync(nccOut, "utf8");
const output =
  bundle +
  "\n// Vercel serverless config\n" +
  "module.exports.config = { maxDuration: 30 };\n";

fs.writeFileSync(bundleOut, output, "utf8");

const sizeKb = Math.round(fs.statSync(bundleOut).size / 1024);
console.log(`dist/vercel-app.js written (${sizeKb} KB) — Express fully inlined`);

const rootEntry = path.join(root, "index.js");
const rootWrapper = `"use strict";

// Vercel Express entrypoint: must import express directly for framework detection.
const express = require("express");

const appModule = require("./dist/vercel-app.js");
const app = appModule.default || appModule;

module.exports = app;
module.exports.config = {
  maxDuration: 30,
};
`;

fs.writeFileSync(rootEntry, rootWrapper, "utf8");
console.log("index.js entrypoint written with require('express')");
