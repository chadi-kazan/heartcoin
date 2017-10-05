const combineRouters = require('koa-combine-routers');
const secureRouter = require('./secure');
const publicRouter = require('./public.router');
const accountsRouter = require('./accounts');

module.exports = combineRouters([...secureRouter, ...accountsRouter, publicRouter]);
