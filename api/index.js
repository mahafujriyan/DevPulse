/**
 * Vercel serverless entry — CommonJS, loads compiled Express app from dist/
 * Do NOT call app.listen() here.
 */
const appModule = require("../dist/app");
const app = appModule.default || appModule;

module.exports = app;
module.exports.config = {
  maxDuration: 30,
};
