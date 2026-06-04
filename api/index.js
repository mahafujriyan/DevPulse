/**
 * Vercel serverless entry
 * Loads compiled Express app from dist
 */

const appModule = require("../dist/app");

const app = appModule.default || appModule;

module.exports = app;