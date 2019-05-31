require('dotenv').config();
const config = require('./config');
const Hapi = require('@hapi/hapi');

const rp = require('request-promise-native').defaults({
  proxy: null,
  strictSSL: false
});

const server = Hapi.server(config.server);

// isSecure = true for live...
const yarOptions = {
  storeBlank: false,
  cookieOptions: {
    password: 'the-password-must-be-at-least-32-characters-long',
    isSecure: false
  }
};

async function validateBasic (request, userName, password) {
  const data = {
    user_name: userName,
    password,
    application: config.application
  };

  try {
    const options = {
      url: `${process.env.IDM_URI}/user/login`,
      method: 'POST',
      json: true,
      headers: { Authorization: process.env.JWT_TOKEN },
      body: data
    };

    const { user_id: id, user_name: name, err: responseError } = await rp(options);

    if (responseError || !id) {
      return { isValid: false, credentials: null };
    }

    return { isValid: true, credentials: { id, name } };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

const validateJWT = async decoded => {
  const isValid = !!decoded.id;
  return { isValid };
};

async function start () {
  try {
    await server.register([
      { plugin: require('@hapi/yar'), options: yarOptions },
      { plugin: require('@hapi/basic') },
      { plugin: require('hapi-auth-jwt2') },
      { plugin: require('@hapi/inert') },
      { plugin: require('@hapi/vision') }
    ]);

    server.auth.strategy('simple', 'basic', { validate: validateBasic });
    server.auth.default('simple');

    server.auth.strategy('jwt', 'jwt', {
      key: process.env.JWT_SECRET,
      validate: validateJWT,
      verifyOptions: { algorithms: [ 'HS256' ] }
    });

    // load views
    server.views(require('./src/views'));

    // load routes
    // route for public static content
    server.route(require('./src/routes/public'));
    // route for admin UI components
    server.route(require('./src/routes/admin'));
    server.route(require('./src/routes/status'));

    if (!module.parent) {
      await server.start();
    }
  } catch (err) {
    throw err;
  }
  return server;
};

module.exports = server;
start();
