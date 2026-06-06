"use strict";

// Vercel entrypoint scan fallback. The real serverless handler is generated at
// build time by scripts/build-vercel.cjs into api/index.js.
module.exports = require("./api/index.js");
'use strict';
const appModule = require("./api/ncc-bundle/index.js");
const app = appModule.default || appModule;
module.exports = app;
module.exports.config = { maxDuration: 30 };
