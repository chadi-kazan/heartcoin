const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const auditLog = require('audit-log');
const { logInfo, logError } = require('../middlewares/logger');
const SECURITY_KEY = require('../middlewares/security.config');
const httpStatus = require('http-status');

const SALT_WORK_FACTOR = 10;

// use native promises instead of mPromise used by mongoose
mongoose.Promise = global.Promise;
/**
 * User schema
 */
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  events: [{
    title: String,
    description: String,
    location: String,
    date: Date,
    time: String,
  }],
});

/**
 * Pre-save hooks
 */
UserSchema.pre('save', async function (next) {
  logInfo(`Modifying password of user ${this.username}`);
  const user = this;
    // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    logInfo('new password matches old password, user password was not modified');
    return next();
  }

  let salt;
  try {
        // generate a salt
    salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        // hash the password along with our new salt
    const hash = await bcrypt.hash(user.password, salt);
        // override the clear-text password with the hashed one
    user.password = hash;
    return next();
  } catch (err) {
    logError(`an error occured while saving user ${user.username}'s password`, err);
    return next(err);
  }
});


/**
 * Methods
 */
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const createToken = (user, remember) => {
  let token;
  if (remember) {
    token = jsonwebtoken.sign(user, SECURITY_KEY, {
      expiresIn: 10080, // expires in 7 days
    });
  } else {
    token = jsonwebtoken.sign(user, SECURITY_KEY, {
      expiresIn: 1440, // expires in 24 hours
    });
  }
  return token;
};

/**
 * Statics
 */

UserSchema.statics.getAuthenticated = async function (user) {
  logInfo('getAuthenticated', user);
  let doc;
  try {
    doc = await this.findOne({ username: user.username });
  } catch (err) {
    logError('error retrieving user info ', err);
    throw err;
  }
    // make sure the user exists
  if (!doc) {
    logError('user not found ', user);
    const err = new Error('Invalid username or password.');
    err.status = httpStatus.NOT_FOUND;
    err.name = 'invalid user';
    err.expose = true;
    throw err;
  } else {
    const req = user;
        // test for a matching password
    const isMatch = await doc.comparePassword(user.password);
    if (isMatch) {
      const token = createToken(user, req.remember);
      return { user, id_token: token };
    }
    const err = new Error('Invalid username or password.');
    err.status = httpStatus.BAD_REQUEST;
    err.name = 'credentials error';
    err.expose = true;
    throw err;
  }
};


UserSchema.statics.Create = async function (user) {
  let doc;
  try {
        // find a user in Mongo with provided username
    doc = await this.findOne({ username: user.username });
  } catch (err) {
    logError(`could not create user ${user} in db`, err);
    throw err;
  }
    // already exists
  if (doc) {
    const err = new Error('Username already taken');
    err.status = httpStatus.CONFLICT;
    err.name = 'username unavailable';
    err.expose = true;
    throw err;
  } else {
    if (user.password !== user.confirm) {
      const err = new Error('Invalid username or password.');
      err.status = httpStatus.BAD_REQUEST;
      err.name = 'invalid password';
      err.expose = true;
      throw err;
    }

        // if there is no user with that username
        // create the user
    const User = mongoose.model('User', UserSchema);
    const newUser = new User({
      password: user.password,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    });
        // save the user
    await newUser.save();
    return { user: newUser, id_token: createToken(newUser, user.remember) };
  }
};

UserSchema.statics.addNetworkingEvent = async function (user, event) {
  try {
        // find the current user
    await this.update({ username: user.username }, { $push: { events: event } });
  } catch (err) {
    logError(`could not log networking event ${event} for user ${user}`);
    throw err;
  }
};

const pluginFn = auditLog.getPlugin('mongoose', { modelName: 'User' }); // setup occurs here
UserSchema.plugin(pluginFn.handler); // .handler is the pluggable function for mongoose in this case


/**
 * Register UserSchema
 */
module.exports = mongoose.model('User', UserSchema);
