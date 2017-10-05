const Router = require('koa-router');

const secureRouter = new Router({ prefix: '/_api' });

module.exports = [secureRouter];
