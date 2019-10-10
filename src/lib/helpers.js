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

// make an http request (with a body), uses promises
function makeURIRequestWithBody (uri, method, data, headers) {
  return new Promise((resolve, reject) => {
    console.log(method + ' request to ' + uri);

    const options = {
      method: method,
      uri: uri,
      body: data,
      json: true,
      headers: headers || { Authorization: process.env.JWT_TOKEN }
    };

    rp(options)
      .then(function (response) {
        var responseData = {};
        responseData.error = null;
        responseData.statusCode = 200;
        responseData.body = response;
        console.log('resolve request to ' + uri);
        resolve(responseData);
      })
      .catch(function (response) {
        var responseData = {};
        responseData.error = response.error;
        responseData.statusCode = response.statusCode;
        responseData.body = response.body;
        console.log('reject request to ' + uri);
        reject(responseData);
      });
  });
}

function addPaginationDetail (pagination) {
  pagination.nextPage = pagination.page;
  if (pagination.nextPage > pagination.pageCount) {
    delete pagination.nextPage;
  }

  if (pagination.page > 1) {
    pagination.prevPage = pagination.page - 1;
  }
  return pagination;
}

const showUnlinkAll = env => {
  return [true, 'true', '1'].includes(env.TEST_MODE) ||
    env.NODE_ENV === 'preprod';
};

module.exports = {
  makeURIRequestWithBody,
  makeURIRequest,
  addPaginationDetail,
  showUnlinkAll
};
