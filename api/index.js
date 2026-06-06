/**
 * Vercel serverless entry — loads @vercel/ncc bundle (Express fully inlined).
 * Do NOT call app.listen() here.
 */
const appModule = require("./ncc-bundle/index.js");
const app = appModule.default || appModule;

module.exports = app;
module.exports.config = {
  maxDuration: 30,
};
