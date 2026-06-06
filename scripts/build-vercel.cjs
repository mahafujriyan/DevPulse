const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const outfile = path.join(__dirname, "../api/handler.cjs");

esbuild.buildSync({
  entryPoints: [path.join(__dirname, "../src/application.ts")],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  outfile,
  external: ["bcrypt", "pg", "pg-native", "cpu-features"],
  logLevel: "info",
});

if (!fs.existsSync(outfile)) {
  console.error("Vercel build failed: api/handler.cjs was not created");
  process.exit(1);
}

console.log("api/handler.cjs built successfully (Express bundled)");
