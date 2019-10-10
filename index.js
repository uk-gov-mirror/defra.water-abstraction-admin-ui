require('dotenv').config();
const config = require('./config');
const Hapi = require('@hapi/hapi');
const idmConnector = require('./src/lib/connectors/idm');

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
  try {
    const response = await idmConnector.attemptLogin(userName, password);
    const { user_id: id, user_name: name } = response.body;
    return { isValid: true, credentials: { id, name } };
  } catch (err) {
    if (err.statusCode >= 500) {
      console.log(err);
    }
    return { isValid: false, credentials: null };
  }
}

const validateJWT = async decoded => {
  const isValid = !!decoded.id;
  return { isValid };
};

const registerPlugins = server => {
  return server.register([
    { plugin: require('@hapi/yar'), options: yarOptions },
    { plugin: require('@hapi/basic') },
    { plugin: require('hapi-auth-jwt2') },
    { plugin: require('@hapi/inert') },
    { plugin: require('@hapi/vision') }
  ]);
};

const registerRoutes = server => {
  // route for public static content
  server.route(require('./src/routes/public'));
  // route for admin UI components
  server.route(require('./src/routes/admin'));
  server.route(require('./src/routes/status'));
};

async function start () {
  try {
    await registerPlugins(server);

    server.auth.strategy('simple', 'basic', { validate: validateBasic });
    server.auth.default('simple');

    server.auth.strategy('jwt', 'jwt', {
      key: process.env.JWT_SECRET,
      validate: validateJWT,
      verifyOptions: { algorithms: [ 'HS256' ] }
    });

    // load views
    server.views(require('./src/views'));

    registerRoutes(server);

    if (!module.parent) {
      await server.start();
    }
  } catch (err) {
    throw err;
  }
};

module.exports = server;
start();
