//provides Admin gui, consumes water service
require('dotenv').config()

const Hapi = require('hapi')


const serverOptions = { connections: { router: { stripTrailingSlash: true } } }
const server = new Hapi.Server(serverOptions)
const SanitizePayload = require('hapi-sanitize-payload')



const Helpers = require('./src/lib/helpers.js')

server.connection({ port: process.env.PORT || 8000 })

if (process.env.DATABASE_URL) {
  // get heroku db params from env vars


  var workingVariable = process.env.DATABASE_URL.replace('postgres://', '')
  process.env.PGUSER = workingVariable.split('@')[0].split(':')[0]
  process.env.PGPASSWORD = workingVariable.split('@')[0].split(':')[1]
  process.env.PGHOST = workingVariable.split('@')[1].split(':')[0]
  process.env.PSPORT = workingVariable.split('@')[1].split(':')[1].split('/')[0]
  process.env.PGDATABASE = workingVariable.split('@')[1].split(':')[1].split('/')[1]
}

const cacheKey = process.env.cacheKey || 'super-secret-cookie-encryption-key'
const sessionPluginOptions = {
  cache: { segment: 'unique-cache-sement' },
  cookie: { isSecure: false },
  key: 'bla-bla-bla'
}

// isSecure = true for live...
var yar_options = {
  storeBlank: false,
  cookieOptions: {
    password: 'the-password-must-be-at-least-32-characters-long',
    isSecure: false
  }
}





server.register([{
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
    options: yar_options
  },




  require('hapi-auth-basic'), require('inert'), require('vision')
], (err) => {
  if (err) {
    throw err
  }

  function validateBasic(request, user_name, password, callback) {
    // basic login for admin function UI
    console.log(`Validating user request for ${user_name} with ${password}`)

    var data = {};
    data.user_name = user_name
    data.password = password
    const httpRequest = require('request').defaults({
      proxy: null,
      strictSSL: false
    })

    var method = 'post'
    URI = process.env.IDM_URI + '/user/loginAdmin' + '?token=' + process.env.JWT_TOKEN;
    console.log(URI)
    httpRequest({
        method: method,
        url: URI,
        form: data
      },
      function(err, httpResponse, body) {
        console.log('got http ' + method + ' response')
        responseData = JSON.parse(body)
        if (responseData.err) {
          return callback(null, false)
        } else {
          callback(null, true, { id: responseData.user_id, name: data.user_name })
        }


      });

  }



  server.auth.strategy('simple', 'basic', { validateFunc: validateBasic })

  server.auth.default('simple');

  // load views
  server.views(require('./src/views'))

  // load routes
  //route for public static content
  server.route(require('./src/routes/public'))
  //route for admin UI components
  server.route(require('./src/routes/admin'))
  server.route(require('./src/routes/status'))

})

// Start the server if not testing with Lab
if (!module.parent) {
  server.start((err) => {
    if (err) {
      throw err
    }
    console.log(`Service ${process.env.servicename} running at: ${server.info.uri}`)
  })
}
module.exports = server