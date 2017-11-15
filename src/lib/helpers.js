var bcrypt = require('bcrypt');

//contains generic functions unrelated to a specific component
var rp = require('request-promise-native').defaults({
    proxy:null,
    strictSSL :false
  })

//make a simple http request (without a body), uses promises
function makeURIRequest(uri) {
  return new Promise((resolve, reject) => {
    console.log('request to '+uri)
    var options = {
      method: 'get',
      uri: uri
    };
    rp(options)
      .then(function(response) {

        var responseData = {};
        responseData.error = null
        responseData.statusCode = 200
        responseData.body = response
        console.log('resolve request to '+uri)
        resolve(responseData);
      })
      .catch(function(response) {
        var responseData = {};
        responseData.error = response.error
        responseData.statusCode = response.statusCode
        responseData.body = response.body
        console.log('reject request to '+uri)
        console.log(responseData)
        reject(responseData);
      });
  })
}

//make an http request (with a body), uses promises
function makeURIRequestWithBody(uri, method, data) {
  return new Promise((resolve, reject) => {
  console.log(method+' request to '+uri)
    var options = {
      method: method,
      uri: uri,
      body: data,
      json: true
    };

    rp(options)
      .then(function(response) {
        var responseData = {};
        responseData.error = null
        responseData.statusCode = 200
        responseData.body = response
        console.log('resolve request to '+uri)
        resolve(responseData);
      })
      .catch(function(response) {
        var responseData = {};
        responseData.error = response.error
        responseData.statusCode = response.statusCode
        responseData.body = response.body
        console.log('reject request to '+uri)
        console.log(responseData)

        reject(responseData);
      });

  })

}


function createGUID() {
  function s4 () {
    return Math.floor((1 + Math.random()) * 0x10000)
  .toString(16)
  .substring(1)
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
s4() + '-' + s4() + s4() + s4()
}


function createHash(string){
  return new Promise((resolve, reject) => {
  const saltRounds = 10;
  bcrypt.hash(string, saltRounds, function(err, hash) {
    if(err){
      reject(err)
    }
    resolve(hash)
  })
});
}

function compareHash(string1,string2,cb){
  console.log('bcrypt compare')
  console.log('atring 1 ='+string1)
  console.log('atring 2 ='+string2)
  bcrypt.compare(string1,string2, (err, res)=> {
    console.log('bcrypt compare')
    console.log(err)
    console.log(res)
    if(res){
      console.log('password OK, authorised!')
    } else {
      console.log('password FAIL, unauthorised!')
    }
    console.log('-----')
    cb(err,res)
  })
}

function encryptToken (data) {
  var key = process.env.JWT_SECRET
  var JWT = require('jsonwebtoken')
  var token = JWT.sign(data, key)
  return(token)
}

function decryptToken(token){
  var key = process.env.JWT_SECRET
  var JWT = require('jsonwebtoken')
  var data = JWT.decode(token, key)
  console.log('token decoded')
  console.log(data)
  return(data)
}


module.exports = {
  createGUID:createGUID,
  createHash:createHash,
  compareHash:compareHash,
  encryptToken:encryptToken,
  decryptToken:decryptToken,
  makeURIRequestWithBody:makeURIRequestWithBody,
  makeURIRequest:makeURIRequest

}
