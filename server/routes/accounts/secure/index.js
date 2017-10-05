const user = require('../../../models/user');
const httpStatus = require('http-status');
const passwordMatcherMiddleware = require('../middlewares/password.matcher');
const Router = require('koa-router');

const router = new Router({ prefix: '/_api/accounts' });

router.put('/:username', passwordMatcherMiddleware,
    async (ctx) => {
      const fields = ctx.request.body;
      try {
        const existingUser = await user.findOne({ username: fields.username });
        if (!existingUser) {
          ctx.status = httpStatus.NOT_FOUND;
        } else {
          await user.update({ username: fields.username }, { $set: { password: fields.password } });
          ctx.body = {
            username: existingUser.username,
          };
        }
      } catch (err) {
        ctx.status = httpStatus.INTERNAL_SERVER_ERROR;
        ctx.statusText = err.message;
        ctx.body = { error: err.message };
      }
    }
);
module.exports = router;
