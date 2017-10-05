const Router = require('koa-router');

const publicRouter = new Router({prefix: '/_public'});
publicRouter.get('/', async (ctx, next) => {
    ctx.body = {};
});

module.exports = publicRouter;
