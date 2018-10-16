// provides Admin gui, consumes water service
require('dotenv').config();
const config = require('./config');
const Hapi = require('hapi');

const serverOptions = { connections: { router: { stripTrailingSlash: true } } };
const server = new Hapi.Server(serverOptions);

server.connection({ port: process.env.PORT || 8000 });

if (process.env.DATABASE_URL) {
  // get heroku db params from env vars
  const workingVariable = process.env.DATABASE_URL.replace('postgres://', '');
  process.env.PGUSER = workingVariable.split('@')[0].split(':')[0];
  process.env.PGPASSWORD = workingVariable.split('@')[0].split(':')[1];
  process.env.PGHOST = workingVariable.split('@')[1].split(':')[0];
  process.env.PSPORT = workingVariable.split('@')[1].split(':')[1].split('/')[0];
  process.env.PGDATABASE = workingVariable.split('@')[1].split(':')[1].split('/')[1];
}

// isSecure = true for live...
const yarOptions = {
  storeBlank: false,
  cookieOptions: {
    password: 'the-password-must-be-at-least-32-characters-long',
    isSecure: false
  }
};

function validateBasic (request, userName, password, callback) {
  const data = {
    user_name: userName,
    password,
    application: config.application
  };
  const httpRequest = require('request').defaults({
    proxy: null,
    strictSSL: false
  });

  const method = 'post';
  const url = `${process.env.IDM_URI}/user/login?token=${process.env.JWT_TOKEN}`;

  httpRequest({ method, url, form: data }, function (err, httpResponse, body) {
    if (err) {
      console.log(err);
      return callback(null, false);
    }

    const responseData = JSON.parse(body) || {};
    const { user_id: id, user_name: name, err: responseError } = responseData;

    if (responseError || !id) {
      return callback(null, false);
    }
    return callback(null, true, { id, name });
  });
}

const validateJWT = (decoded, request, callback) => {
  const isValid = !!decoded.id;
  console.log(decoded);
  console.log(isValid);
  return callback(null, isValid);
};

server.register([
  {
    register: require('node-hapi-airbrake-js'),
    options: {
      key: process.env.errbit_key,
      host: process.env.errbit_server
    }
  }, {
    // Plugin to display the routes table to console at startup
    // See https://www.npmjs.com/package/blipp
    register: require('blipp'),
    options: {
      showAuth: true
    }
  },
  {
    register: require('yar'),
    options: yarOptions
  },
  require('hapi-auth-basic'),
  require('hapi-auth-jwt2'),
  require('inert'),
  require('vision')
], (err) => {
  if (err) {
    throw err;
  }

  server.auth.strategy('simple', 'basic', { validateFunc: validateBasic });
  server.auth.default('simple');

  server.auth.strategy('jwt', 'jwt',
    { key: process.env.JWT_SECRET,          // Never Share your secret key
      validateFunc: validateJWT,            // validate function defined above
      verifyOptions: { algorithms: [ 'HS256' ] } // pick a strong algorithm
    });

  // load views
  server.views(require('./src/views'));

  // load routes
  // route for public static content
  server.route(require('./src/routes/public'));
  // route for admin UI components
  server.route(require('./src/routes/admin'));
  server.route(require('./src/routes/status'));
});

// Start the server if not testing with Lab
if (!module.parent) {
  server.start((err) => {
    if (err) {
      throw err;
    }
    console.log(`Service ${process.env.servicename} running at: ${server.info.uri}`);
  });
}
module.exports = server;
