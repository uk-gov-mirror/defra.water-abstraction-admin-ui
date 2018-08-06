const Helpers = require('../helpers');
const { APIClient } = require('hapi-pg-rest-api');
const rp = require('request-promise-native').defaults({
  proxy: null,
  strictSSL: false
});

function naldImport () {
  console.log('requesting nald import');
  var uri = process.env.WATER_URI + '/nald/import?token=' + process.env.JWT_TOKEN;
  console.log(uri);
  return new Promise((resolve, reject) => {
    Helpers.makeURIRequest(uri)
      .then((response) => {
        var data = JSON.parse(response.body);
        resolve(data);
      }).catch((response) => {
        reject(response);
      });
  });
}

function naldLicence (licence_number) {
  console.log('requesting nald licence');
  var uri = process.env.WATER_URI + '/nald/licence?token=' + process.env.JWT_TOKEN;
  requestBody = { licence_number: licence_number };

  console.log(uri);
  console.log(requestBody);
  return new Promise((resolve, reject) => {
    Helpers.makeURIRequestWithBody(
        uri,
        'post',
        requestBody)
      .then((response) => {
        var data = response.body;
        resolve(data);
      }).catch((response) => {
        console.log(response);
        resolve(response);
      });
  });
}

async function getSchedules () {
  var uri = process.env.WATER_URI + '/scheduler';
  try {
    res = await Helpers.makeURIRequest(uri);
    return JSON.parse(res.body).data;
  } catch (e) {
    return null;
  }
}

async function addSchedule (data) {
  console.log('requesting nald licence');
  var uri = process.env.WATER_URI + '/scheduler';
  console.log(uri);
  try {
    res = await Helpers.makeURIRequestWithBody(uri, 'post', data);
    console.log('res.data');
    console.log(res.body);
    return JSON.parse(res.body).data;
  } catch (e) {
    console.log(e);
    return null;
  }
}

const notificationsClient = new APIClient(rp, {
  endpoint: process.env.WATER_URI + '/notification',
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

const notify_templatesClient = new APIClient(rp, {
  endpoint: process.env.WATER_URI + '/notify_templates',
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

const pending_importClient = new APIClient(rp, {
  endpoint: process.env.WATER_URI + '/pending_import',
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

const schedulerClient = new APIClient(rp, {
  endpoint: process.env.WATER_URI + '/scheduler',
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

const taskConfigClient = new APIClient(rp, {
  endpoint: process.env.WATER_URI + '/taskConfig',
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

const getReturnsFormats = async(licenceNumber) => {
  return rp({
    uri: process.env.WATER_URI + '/nald/returns/formats',
    method: 'GET',
    qs: {
      filter: JSON.stringify({licenceNumber})
    },
    json: true,
    headers: {
      Authorization: `Bearer ${process.env.JWT_TOKEN}`
    }
  });
};

const getReturnsLogs = async(regionCode, formatId) => {
  return rp({
    uri: process.env.WATER_URI + '/nald/returns/logs',
    method: 'GET',
    qs: {
      filter: JSON.stringify({regionCode, formatId})
    },
    json: true,
    headers: {
      Authorization: `Bearer ${process.env.JWT_TOKEN}`
    }
  });
};

const getReturnsLines = async(regionCode, formatId, dateFrom) => {
  return rp({
    uri: process.env.WATER_URI + '/nald/returns/lines',
    method: 'GET',
    qs: {
      filter: JSON.stringify({regionCode, formatId, dateFrom})
    },
    json: true,
    headers: {
      Authorization: `Bearer ${process.env.JWT_TOKEN}`
    }
  });
};

module.exports = {
  naldImport,
  naldLicence,
  getSchedules,
  addSchedule,
  notifications: notificationsClient,
  notify_templates: notify_templatesClient,
  pending_import: pending_importClient,
  scheduler: schedulerClient,
  task_config: taskConfigClient,
  getReturnsFormats,
  getReturnsLogs,
  getReturnsLines
};
