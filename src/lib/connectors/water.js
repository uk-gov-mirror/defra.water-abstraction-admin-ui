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

function naldLicence (licenceNumber) {
  console.log('requesting nald licence');
  const uri = process.env.WATER_URI + '/nald/licence?token=' + process.env.JWT_TOKEN;
  const requestBody = { licence_number: licenceNumber };

  console.log(uri);
  console.log(requestBody);
  return new Promise((resolve, reject) => {
    Helpers.makeURIRequestWithBody(uri, 'post', requestBody)
      .then((response) => {
        const data = response.body;
        resolve(data);
      }).catch((response) => {
        console.error(response);
        resolve(response);
      });
  });
}

async function getSchedules () {
  const uri = process.env.WATER_URI + '/scheduler';
  try {
    const res = await Helpers.makeURIRequest(uri);
    return JSON.parse(res.body).data;
  } catch (e) {
    return null;
  }
}

async function addSchedule (data) {
  console.log('requesting nald licence');
  const uri = process.env.WATER_URI + '/scheduler';
  try {
    const res = await Helpers.makeURIRequestWithBody(uri, 'post', data);
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

const notifyTemplatesClient = new APIClient(rp, {
  endpoint: process.env.WATER_URI + '/notify_templates',
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

const pendingImportClient = new APIClient(rp, {
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

const getReturnsNotificationOptions = (payload, isPreview, verbose = false) => {
  const uri = process.env.WATER_URI + `/returns-notifications/invite/${isPreview ? 'preview' : 'send'}`;

  const qs = verbose ? { verbose: 1 } : {};

  return {
    uri,
    qs,
    method: 'POST',
    body: payload,
    json: true,
    headers: {
      Authorization: `Bearer ${process.env.JWT_TOKEN}`
    }
  };
};

const previewReturnsInvitation = async(payload, verbose = false) => {
  return rp(getReturnsNotificationOptions(payload, true, verbose));
};

const sendReturnsInvitation = async(payload) => {
  return rp(getReturnsNotificationOptions(payload, false));
};

const picklistsClient = new APIClient(rp, {
  endpoint: process.env.WATER_URI + '/picklists',
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

const picklistItemsClient = new APIClient(rp, {
  endpoint: process.env.WATER_URI + '/picklist-items',
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

const eventsClient = new APIClient(rp, {
  endpoint: process.env.WATER_URI + '/event',
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

/**
 * Send/preview returns forms
 * @param {String} notificationType - the type of message to send, e.g. pdf.return_reminder
 * @param {Object} payload - request body sent as JSON
 * @param {Boolean} [isPreview] - whether preview, defaults to true
 * @return Promise - resolves when API call completes
 */
const sendReturnsForms = (notificationType, payload, isPreview = true) => {
  const uri = process.env.WATER_URI + `/returns-notifications/${isPreview ? 'preview' : 'send'}/${notificationType}`;

  const options = {
    uri,
    method: 'POST',
    body: payload,
    json: true,
    headers: {
      Authorization: `Bearer ${process.env.JWT_TOKEN}`
    }
  };

  return rp(options);
};

module.exports = {
  naldImport,
  naldLicence,
  getSchedules,
  addSchedule,
  notifications: notificationsClient,
  notify_templates: notifyTemplatesClient,
  pending_import: pendingImportClient,
  scheduler: schedulerClient,
  task_config: taskConfigClient,
  getReturnsFormats,
  getReturnsLogs,
  getReturnsLines,
  previewReturnsInvitation,
  sendReturnsInvitation,
  picklists: picklistsClient,
  picklistItems: picklistItemsClient,
  events: eventsClient,
  sendReturnsForms
};
