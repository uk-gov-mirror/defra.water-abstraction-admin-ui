

//provides Admin gui, consumes water service
require('dotenv').config()

const Hapi = require('hapi')


const serverOptions = {connections: {router: {stripTrailingSlash: true}}}
const server = new Hapi.Server(serverOptions)
const Blipp = require('blipp');
const Disinfect = require('disinfect');
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





server.register([
  {
    register: require('yar'),
    options: yar_options
  },
  {
    // Plugin to display the routes table to console at startup
    // See https://www.npmjs.com/package/blipp
    register: Blipp,
    options: {
      showAuth: true
    }
  }, {
    // Plugin to prevent CSS attack by applying Google's Caja HTML Sanitizer on route query, payload, and params
    // See https://www.npmjs.com/package/disinfect
    register: Disinfect,
    options: {
      deleteEmpty: true,
      deleteWhitespace: true,
      disinfectQuery: true,
      disinfectParams: true,
      disinfectPayload: true
    }
  }, {
    // Plugin to recursively sanitize or prune values in a request.payload object
    // See https://www.npmjs.com/package/hapi-sanitize-payload
    register: SanitizePayload,
    options: {
      pruneMethod: 'delete'
    }
  },



  require('hapi-auth-basic'), require('hapi-auth-jwt2'), require('inert'), require('vision')], (err) => {
  if (err) {
    throw err
  }

  function validateBasic (request, user_name, password, callback) {
    // basic login for admin function UI
    console.log(`Validating user request for ${user_name} with ${password}`)

    var data={};
    data.user_name=user_name
    data.password=password
    const httpRequest = require('request')

    var method='post'
    URI=process.env.IDM_URI+'/user/loginAdmin'+ '?token=' + process.env.JWT_TOKEN;
    console.log(URI)
      httpRequest({
                method: method,
                url: URI ,
                form: data
            },
            function (err, httpResponse, body) {
                console.log('got http ' + method + ' response')
                console.log(err)
                console.log(httpResponse)
                console.log(body)
                responseData=JSON.parse(body)
                if (responseData.err) {
                  return callback(null, false)
                } else {
                  callback(null, true, { id: responseData.user_id, name: data.user_name })
                }


            });

  }

  function validateJWT(decoded, request, callback){
    // bring your own validation function
    console.log(request.url.path)
    console.log(request.payload)
      console.log('CALL WITH TOKEN')
      console.log(decoded)
        // TODO: JWT tokens to DB...
        // do your checks to see if the person is valid
      if (!decoded.id) {
        console.log('boo... JWT failed')
        return callback(null, false)
      } else {
        console.log('huzah... JWT OK')
        return callback(null, true)
      }
    }


  server.auth.strategy('simple', 'basic', { validateFunc: validateBasic })

  server.auth.strategy('jwt', 'jwt',
    { key: process.env.JWT_SECRET,          // Never Share your secret key
      validateFunc: validateJWT,            // validate function defined above
      verifyOptions: {} // pick a strong algorithm
    })

  server.auth.default('jwt')

  // load views
  server.views(require('./src/views'))

  // load routes
  //route for public static content
  server.route(require('./src/routes/public'))
  //route for admin UI components
  server.route(require('./src/routes/admin'))


})

// Start the server
server.start((err) => {
  if (err) {
    throw err
  }



  console.log(`Service ${process.env.servicename} running at: ${server.info.uri}`)
})
module.exports = server
