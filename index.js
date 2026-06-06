"use strict";



// Vercel Express entrypoint: must import express directly for framework detection.

const express = require("express");



const appModule = require("./dist/vercel-app.js");

const app = appModule.default || appModule;



module.exports = app;

module.exports.config = {

  maxDuration: 30,

};

