"use strict";



// Vercel Express framework scans for require('express') in this file.

// if (false) never runs — avoids loading node_modules/express (missing ./router).

if (false) require("express");



const handler = require("./api/index.js");

module.exports = handler;

module.exports.config = handler.config || { maxDuration: 30 };

