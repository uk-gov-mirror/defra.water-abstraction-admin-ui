const Helpers = require('../helpers');
const { APIClient } = require('hapi-pg-rest-api');

const rp = require('request-promise-native').defaults({
  proxy: null,
  strictSSL: false
});
const crmKPI = require('./crm/kpi');
// Docs client
const client = new APIClient(rp, {
  endpoint: process.env.CRM_URI + '/documentHeader',
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

const verificationsClient = new APIClient(rp, {
  endpoint: process.env.CRM_URI + '/verification',
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

const entitiesClient = new APIClient(rp, {
  endpoint: process.env.CRM_URI + '/entity',
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

const documentEntitiesClient = new APIClient(rp, {
  endpoint: process.env.CRM_URI + '/document/{documentId}/entities',
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

const documentVerificationsClient = new APIClient(rp, {
  endpoint: process.env.CRM_URI + '/document_verifications',
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

/**
 * Unlink a document from company/verification process
 * @param {String} document_id - the CRM document ID
 * @return {Promise} resolves with data from CRM API
 */
function unlinkDocument (documentId) {
  return client.updateOne(documentId, {
    verified: null,
    company_entity_id: null,
    verification_id: null
  });
}

/**
 * Unlink all documents from company/verification process
 * @return {Promise} resolves with data from CRM API
 */
function unlinkAllDocuments () {
  const filter = {
    system_id: 'permit-repo'
  };

  return client.updateMany(filter, {
    verified: null,
    company_entity_id: null,
    verification_id: null
  });
}

function createEntity (entity) {
  return new Promise((resolve, reject) => {
    const uri = process.env.CRM_URI + '/entity';
    Helpers.makeURIRequestWithBody(uri, 'post', entity)
      .then((response) => {
        console.log('crm entity response', response.body);
        resolve(response.body.data.entity_id);
      }).catch(error => {
        console.error(error);
        reject(error);
      });
  });
}

function findDocument (params) {
  return new Promise((resolve, reject) => {
    const uri = process.env.CRM_URI + '/documentHeader/filter';
    Helpers.makeURIRequestWithBody(uri, 'post', params)
      .then((response) => {
        resolve(response.body);
      }).catch(error => {
        console.error(error);
        reject(error);
      });
  });
}

function updateDocumentOwner (params) {
  return new Promise((resolve, reject) => {
    var uri = process.env.CRM_URI + '/documentHeader/' + params.document_id + '/owner?token=' + process.env.JWT_TOKEN;
    var method = 'put';
    var data = { entity_id: params.entity_id };
    console.log(data);
    Helpers.makeURIRequestWithBody(uri, method, data)
      .then((response) => {
        console.log('crm entity response');
        console.log(response.body);
        resolve(response.body);
      }).catch(error => {
        console.error(error);
        reject(error);
      });
  });
}

function getDocument (params) {
  return new Promise((resolve, reject) => {
    const uri = process.env.CRM_URI + '/documentHeader/' + params.document_id + '?token=' + process.env.JWT_TOKEN;
    const data = { entity_id: params.entity_id };
    console.log(data);
    Helpers.makeURIRequestWithBody(uri, 'get', data)
      .then((response) => {
        resolve(response.body);
      }).catch(error => {
        console.error(error);
        reject(error);
      });
  });
}

function addRole (params) {
  return new Promise((resolve, reject) => {
    const data = params;
    if (data.company_entity_id && data.company_entity_id.length === 0) {
      delete data.company_entity_id;
    }
    const uri = process.env.CRM_URI + '/entity/' + data.entity_id + '/roles';
    const method = 'post';
    const headers = { Authorization: process.env.JWT_TOKEN };

    Helpers.makeURIRequestWithBody(uri, method, data, headers)
      .then((response) => {
        resolve(response.body);
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
}

function deleteRole (params) {
  return new Promise((resolve, reject) => {
    const data = {};
    const uri = process.env.CRM_URI + '/entity/' + params.entity_id + '/roles/' + params.role_id;
    const headers = { Authorization: process.env.JWT_TOKEN };
    Helpers.makeURIRequestWithBody(uri, 'delete', data, headers)
      .then((response) => {
        resolve(response.body);
      })
      .catch(error => reject(error));
  });
}

module.exports = {
  createEntity,
  findDocument,
  updateDocumentOwner,
  getDocument,
  addRole,
  deleteRole,
  unlinkDocument,
  unlinkAllDocuments,
  verifications: verificationsClient,
  entities: entitiesClient,
  documents: client,
  documentEntities: documentEntitiesClient,
  document_verifications: documentVerificationsClient,
  kpi: crmKPI
};
