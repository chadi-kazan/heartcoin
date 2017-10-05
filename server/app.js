const koaBetterBody = require('koa-better-body');
const Koa = require('koa');
const logger = require('koa-logger');

require('./models');
const jwt = require('./middlewares/jwt');
const SECURITY_KEY = require('./middlewares/security.config');
const koaException = require('koa-error');
const router = require('./routes');

const app = new Koa();
app.use(logger());
// TODO implement my own exception handler, see https://github.com/qixin1991/koa-exception/blob/master/index.js
app.use(koaException());
app.use(jwt.unless({ path: [/^\/_public/] }));
app.use(koaBetterBody({ fields: 'body' }));

app.use(router);
app.listen(3000);
