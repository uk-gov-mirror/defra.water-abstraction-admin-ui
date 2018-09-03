var bcrypt = require('bcrypt');

// contains generic functions unrelated to a specific component
const rp = require('request-promise-native').defaults({
  proxy: null,
  strictSSL: false
});

// make a simple http request (without a body), uses promises
function makeURIRequest (uri, method = 'get') {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'get',
      uri,
      headers: { Authorization: process.env.JWT_TOKEN }
    };
    rp(options)
      .then(function (response) {
        const responseData = {
          error: null,
          statusCode: 200,
          body: response
        };
        console.log('resolve request to ' + uri);
        resolve(responseData);
      })
      .catch(function (response) {
        const responseData = {
          error: response.error,
          statusCode: response.statusCode,
          body: response.body
        };
        console.log('reject request to ' + uri);
        reject(responseData);
      });
  });
}

//make an http request (with a body), uses promises
function makeURIRequestWithBody(uri, method, data,headers) {

  return new Promise((resolve, reject) => {
    if(!headers){
      var headers = {
        Authorization : process.env.JWT_TOKEN
      }
    }
  console.log(method+' request to '+uri)
    var options = {
      method: method,
      uri: uri,
      body: data,
      json: true,
      headers:headers
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
        //console.log(responseData)

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


function compareHash(string1,string2,cb){
  bcrypt.compare(string1,string2, (err, res)=> {
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


function addPaginationDetail(pagination){
  pagination.nextPage=pagination.page;
  if(pagination.nextPage > pagination.pageCount){
    delete pagination.nextPage
  }
  if(pagination.page > 1){
    pagination.prevPage=pagination.page-1
  }
  return pagination;
}


module.exports = {
  createGUID,
  compareHash,
  encryptToken,
  decryptToken,
  makeURIRequestWithBody,
  makeURIRequest,
  addPaginationDetail
};
