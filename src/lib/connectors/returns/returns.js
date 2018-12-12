
const {
  APIClient
} = require('@envage/hapi-pg-rest-api');
const rp = require('request-promise-native').defaults({
  proxy: null,
  strictSSL: false
});

// Create API client
module.exports = new APIClient(rp, {
  endpoint: `${process.env.RETURNS_URI}/returns`,
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});
