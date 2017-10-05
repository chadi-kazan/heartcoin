const user = require('../../models/user');
const httpStatus = require('http-status');
const contextValidator = require('koa-context-validator');
const passwordMatcherMiddleware = require('./middlewares/password.matcher');
const Router = require('koa-router');

const {
    object: objectValidator,
    string: stringValidator,
    boolean: booleanValidator,
    default: validator,
} = contextValidator;
const router = new Router({ prefix: '/_public/accounts' });

router.post('/', validator({
  body: objectValidator().keys({
    firstName: stringValidator().required(),
    lastName: stringValidator().required(),
    username: stringValidator().required(),
    password: stringValidator().required(),
    confirm: stringValidator().required(),
    remember: booleanValidator(),
  }),
}), passwordMatcherMiddleware,
async (ctx) => {
  const fields = ctx.request.body;
  const existingUser = await user.findOne({ username: fields.username });
  if (existingUser) {
    ctx.throw('username unavailable', httpStatus.CONFLICT);
  } else {
    const newUser = await user.Create(fields);
    ctx.body = {
      user: newUser,
    };
  }
});
router.post('/login', validator({
  body: objectValidator().keys({
    username: stringValidator().required(),
    password: stringValidator().required(),
    remember: booleanValidator(),
  }),
}), async (ctx) => {
  const fields = ctx.request.body;
  const authentication = await user.getAuthenticated(fields);
  if (authentication && authentication.id_token) {
            // We are sending the profile inside the token
    ctx.body = authentication;
  } else {
    ctx.throw('invalid username or password', httpStatus.UNAUTHORIZED);
  }
});
module.exports = router;
