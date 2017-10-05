const passwordMatcherMiddleware = async (ctx, next) => {
    if (ctx.request.body.password !== ctx.request.body.confirm) {
        ctx.status = httpStatus.BAD_REQUEST;
        ctx.body = {error: "passwords do not match"};
    } else {
        return next();
    }
};

module.exports = passwordMatcherMiddleware;