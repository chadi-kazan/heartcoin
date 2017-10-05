const SECURITY_KEY = require('./security.config');
const koaJwt = require('koa-jwt');

module.exports = koaJwt({
  secret: SECURITY_KEY,
});
