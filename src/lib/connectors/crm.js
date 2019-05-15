const Helpers = require('../helpers');
const { APIClient } = require('@envage/hapi-pg-rest-api');
const entityRolesClient = require('./crm/entity-roles');

const rp = require('request-promise-native').defaults({
  proxy: null,
  strictSSL: false
});
const crmKPI = require('./crm/kpi');

const createCrmApiClient = path => {
  return new APIClient(rp, {
    endpoint: process.env.CRM_URI + path,
    headers: {
      Authorization: process.env.JWT_TOKEN
    }
  });
};

// Docs client
const client = createCrmApiClient('/documentHeader');
const verificationsClient = createCrmApiClient('/verification');
const entitiesClient = createCrmApiClient('/entity');
const documentEntitiesClient = createCrmApiClient('/document/{documentId}/entities');
const documentVerificationsClient = createCrmApiClient('/document_verifications');

/**
 * Unlink a document from company/verification process
 * @param {String} document_id - the CRM document ID
 * @return {Promise} resolves with data from CRM API
 */
function unlinkDocument (documentId) {
  return client.updateOne(documentId, {
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
    company_entity_id: null,
    verification_id: null
  });
}

function createEntity (entity) {
  return new Promise((resolve, reject) => {
    const uri = process.env.CRM_URI + '/entity';
    Helpers.makeURIRequestWithBody(uri, 'post', entity)
      .then((response) => {
        resolve(response.body.data.entity_id);
      }).catch(error => {
        console.error(error);
        reject(error);
      });
  });
}

function findDocument (params) {
  return client.findMany(params);
}

function updateDocumentOwner (params) {
  return new Promise((resolve, reject) => {
    var uri = process.env.CRM_URI + '/documentHeader/' + params.document_id + '/owner?token=' + process.env.JWT_TOKEN;
    var method = 'put';
    var data = { entity_id: params.entity_id };
    Helpers.makeURIRequestWithBody(uri, method, data)
      .then((response) => {
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
    return Helpers.makeURIRequestWithBody(uri, 'get', data)
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

const getEntityRoles = entityId => {
  return entityRolesClient
    .setParams({ entity_id: entityId })
    .findMany()
    .then(response => response.data);
};

const getEntityContactDocuments = entityId => {
  const uri = `${process.env.CRM_URI}/contacts/${entityId}/documents`;
  return Helpers.makeURIRequest(uri)
    .then(response => {
      return JSON.parse(response.body);
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
};

/**
 * Get all document_entity values for the given entity id,
 * then delete each one.
 */
const deleteEntityContactDocuments = entityID => {
  return getEntityContactDocuments(entityID)
    .then(contactDocuments => {
      const promises = contactDocuments.data.map(doc => {
        return documentEntitiesClient
          .setParams({ documentId: doc.document_id })
          .delete({ entity_id: entityID });
      });
      return Promise.all(promises);
    });
};

const getEntitiesByEmail = (email = '') => {
  return entitiesClient.findMany({
    entity_nm: email.toLowerCase(),
    entity_type: 'individual'
  })
    .then(response => response.data)
    .catch(error => {
      console.error(error);
      throw error;
    });
};

const deleteVerificationDocuments = verificationID => {
  const uri = `${process.env.CRM_URI}/verification/${verificationID}/documents`;
  return Helpers.makeURIRequest(uri, 'delete')
    .catch(error => {
      console.error(error);
      throw error;
    });
};

const deleteVerifications = verificationIDs => {
  const promises = verificationIDs.map(id => verificationsClient.delete({ verification_id: id }));
  return Promise.all(promises);
};

/**
 * Removes all items from the verification_documents and
 * verifications table that are linked to the given entity ID
 */
const deleteVerificationsByEntityID = entityID => {
  return verificationsClient.findMany({ entity_id: entityID })
    .then(response => {
      const verificationIDs = response.data.map(item => item.verification_id);
      const promises = verificationIDs.map(deleteVerificationDocuments);
      return Promise.all(promises)
        .then(() => verificationIDs);
    })
    .then(deleteVerifications);
};

const deleteEntityRoles = entityID => {
  const params = { entity_id: entityID };
  return entityRolesClient.setParams(params).delete(params);
};

module.exports = {
  createEntity,
  findDocument,
  updateDocumentOwner,
  getDocument,
  getEntityRoles,
  addRole,
  deleteRole,
  unlinkDocument,
  unlinkAllDocuments,
  verifications: verificationsClient,
  entities: entitiesClient,
  documents: client,
  documentEntities: documentEntitiesClient,
  document_verifications: documentVerificationsClient,
  kpi: crmKPI,
  getEntityContactDocuments,
  getEntitiesByEmail,
  deleteVerificationsByEntityID,
  deleteEntityRoles,
  deleteEntityContactDocuments,
  entityRoles: entityRolesClient
};
