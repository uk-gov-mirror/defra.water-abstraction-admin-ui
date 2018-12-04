const Helpers = require('../helpers');

const { APIClient } = require('@envage/hapi-pg-rest-api');
const rp = require('request-promise-native').defaults({
  proxy: null,
  strictSSL: false
});
const idmKPI = require('./idm/kpi');

function getUsers () {
  return new Promise((resolve, reject) => {
    var uri = process.env.IDM_URI + '/user';
    Helpers.makeURIRequest(uri)
    .then((response) => {
      console.log('--- user response ---');
      console.log(JSON.parse(response.body).data);
      resolve(JSON.parse(response.body).data);
    }).catch((response) => {
      console.log(response);
      console.log('rejecting in idm.getUsers');
      reject(response);
    });
  });
}

function getUser (params) {
  return new Promise((resolve, reject) => {
    var uri = process.env.IDM_URI + '/user/' + params.user_id + '?token=' + process.env.JWT_TOKEN;
    Helpers.makeURIRequest(uri)
    .then((response) => {
      console.log('user response');
      console.log(response.body);
      resolve(JSON.parse(response.body).data);
    }).catch((response) => {
      console.log(response);
      console.log('rejecting in idm.getUser');
      reject(response);
    });
  });
}

function createUser (data) {
  return new Promise((resolve, reject) => {
    console.log('Create user called');
    console.log(data);
    var uri = process.env.IDM_URI + '/user';
    var method = 'POST';
    console.log('user data');
    console.log(data.user_data);
    Helpers.makeURIRequestWithBody(uri, method, data)
      .then((response) => {
        console.log('user response');
        console.log(response.body);
        resolve(response.body);
      }).catch((response) => {
        console.log(response.error.error);
        console.log('rejecting in idm.getUsers');
        reject(response);
      });
  });
}

function updateUser (userId, payload) {
  return new Promise((resolve, reject) => {
    var data = payload;
    console.log('updateUser');
    console.log(data.reset_guid.length);
    console.log('check guid');
    if (data.reset_guid.length === 0) {
      delete data.reset_guid;
    }

    if (data.reset_required.length === 0) {
      data.reset_required = 0;
    }

    if (data.bad_logins.length === 0) {
      data.bad_logins = 0;
    }

    console.log(data);
    var uri = `${process.env.IDM_URI}/user/${userId}`;
    Helpers.makeURIRequestWithBody(uri, 'PATCH', data)
    .then((response) => {
      resolve(response);
    }).catch((response) => {
      console.log('rejecting in idm.updatePassword');
      reject(response);
    });
  });
}

const usersClient = new APIClient(rp, {
  endpoint: `${process.env.IDM_URI}/user`,
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  users: usersClient,
  usersClient,
  kpi: idmKPI
};
