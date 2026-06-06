/**
 * Vercel serverless entry — @vercel/ncc bundle (Express fully inlined).
 * Do NOT call app.listen() here.
 */
"use strict";

const appModule = require("./ncc-bundle/index.js");
const app = appModule.default || appModule;

module.exports = app;
module.exports.config = {
  maxDuration: 30,
};
