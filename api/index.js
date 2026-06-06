/**
 * Vercel serverless entry — uses esbuild bundle (Express inlined, no ./router trace bug).
 * Do NOT call app.listen() here.
 */
const appModule = require("./handler.cjs");
const app = appModule.default || appModule;

module.exports = app;
module.exports.config = {
  maxDuration: 30,
};
