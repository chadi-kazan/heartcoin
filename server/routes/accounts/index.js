const combineRouters = require('koa-combine-routers');
const secureRouter = require('./secure');
const publicRouter = require('./register');

module.exports = [secureRouter, publicRouter];
