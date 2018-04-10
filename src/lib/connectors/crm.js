const Helpers = require('../helpers')
const {APIClient} = require('hapi-pg-rest-api');

const rp = require('request-promise-native').defaults({
    proxy:null,
    strictSSL :false
  })

// Docs client
const client = new APIClient(rp, {
  endpoint : process.env.CRM_URI + '/documentHeader',
  headers : {
    Authorization : process.env.JWT_TOKEN
  }
});

const verificationsClient = new APIClient(rp, {
  endpoint : process.env.CRM_URI + '/verification',
  headers : {
    Authorization : process.env.JWT_TOKEN
  }
});

const entitiesClient = new APIClient(rp, {
  endpoint : process.env.CRM_URI + '/entity',
  headers : {
    Authorization : process.env.JWT_TOKEN
  }
});




/**
 * Unlink a document from company/verification process
 * @param {String} document_id - the CRM document ID
 * @return {Promise} resolves with data from CRM API
 */
function unlinkDocument(document_id) {
  return client.updateOne(document_id, {
    verified : null,
    company_entity_id : null,
    verification_id : null
  });
}

/**
 * Unlink all documents from company/verification process
 * @return {Promise} resolves with data from CRM API
 */
function unlinkAllDocuments() {

  const filter = {
    system_id : 'permit-repo'
  };

  return client.updateMany(filter, {
    verified : null,
    company_entity_id : null,
    verification_id : null
  });
}


function getLicences(user_name) {
  var uri = process.env.CRM_URI + '/entity/' + user_name + '?token=' + process.env.JWT_TOKEN
  return new Promise((resolve, reject) => {
    Helpers.makeURIRequest(uri)
      .then((response) => {
        var data = JSON.parse(response.body)
        resolve(data.data.documentAssociations)
      }).catch((response) => {
        reject(response)
      })
  });
}


function getLicenceInternalID(licences, document_id) {
  /**this function gets the internal ID (i.e. the ID of the licence in the permit repository) from the document_id
  (from the CRM document header record) which can then be used to retrieve the full licence from the repo **/
  return new Promise((resolve, reject) => {
    var thisLicence = licences.find(x => x.document_id === document_id)
    if (thisLicence) {
      resolve(thisLicence)
    } else {
      reject('Licence with ID ' + document_id + ' could not be found.')
    }
  })
}

function createEntity(entity){

  return new Promise((resolve, reject) => {
    var data=entity;
    //entity_nm;
    //entity_type;
    //entity_definition;

    var uri=process.env.CRM_URI+'/entity'
    var method='post'
    console.log("createEntity")
    console.log(entity)
    Helpers.makeURIRequestWithBody(uri, method,entity)
    .then((response)=>{
      console.log('crm entity response')
      console.log(response.body)
        resolve(response.body.data.entity_id)
    }).catch((response)=>{
      console.log(response.error.error)
      console.log('rejecting in crm.createEntity')
      reject()
    })

  });

}

function findDocument(params){

  return new Promise((resolve, reject) => {
    var data=params;
    //entity_nm;
    //entity_type;
    //entity_definition;

    var uri=process.env.CRM_URI+'/documentHeader/filter'
    var method='post'
    Helpers.makeURIRequestWithBody(uri, method,data)
    .then((response)=>{
      console.log('crm findDocument response')
      console.log(response.body)
        resolve(response.body)
    }).catch((response)=>{
      console.log(response)
      console.log('rejecting in crm.findDocument 1')
      reject()
    })

  });

}

function getDocument(params){

  return new Promise((resolve, reject) => {
    var data=params;
    //entity_nm;
    //entity_type;
    //entity_definition;

    var uri=process.env.CRM_URI+'/documentHeader/filter'
    var method='post'
    Helpers.makeURIRequestWithBody(uri, method,data)
    .then((response)=>{
      console.log('crm findDocument response')
      console.log(response.body)
        resolve(response.body)
    }).catch((response)=>{
      console.log(response)
      console.log('rejecting in crm.findDocument 2')
      reject()
    })

  });

}

function updateDocumentOwner(params){
  return new Promise((resolve, reject) => {
  var uri=process.env.CRM_URI+'/documentHeader/'+params.document_id+'/owner?token='+process.env.JWT_TOKEN
  var method='put'
  var data={entity_id:params.entity_id}
  console.log(data)
  Helpers.makeURIRequestWithBody(uri, method,data)
  .then((response)=>{
    console.log('crm entity response')
    console.log(response.body)
    resolve(response.body)
  }).catch((response)=>{
    console.log(response)
    console.log('rejecting in crm.createEntity')
    reject()
  })
})
}

function getDocument(params){
    return new Promise((resolve, reject) => {

      var uri=process.env.CRM_URI+'/documentHeader/'+params.document_id+'?token='+process.env.JWT_TOKEN
      var method='get'
      var data={entity_id:params.entity_id}
      console.log(data)
      Helpers.makeURIRequestWithBody(uri, method,data)
      .then((response)=>{
        console.log('crm entity response')
        console.log(response.body)
        resolve(response.body)
      }).catch((response)=>{
        console.log(response)
        console.log('rejecting in crm.createEntity')
        reject()
      })


    })
}


function addRole(params){
    return new Promise((resolve, reject) => {
      var data=params
      if(data.company_entity_id.length==0){
        delete data.company_entity_id
      }
      console.log(data)
      var uri=process.env.CRM_URI+'/entity/'+data.entity_id+'/roles'
      var method='post'
      console.log('***** ADD ROLE ****')
      var headers = {
        Authorization : process.env.JWT_TOKEN
      }
      Helpers.makeURIRequestWithBody(uri, method,data,headers)
      .then((response)=>{
        resolve(response.body)
      }).catch((response)=>{
        console.log(response.error.error)
        console.log('rejecting in crm.addRole')
        reject()
      })


    })
}

function deleteRole(params){
    return new Promise((resolve, reject) => {
      var data={}
      var uri=process.env.CRM_URI+'/entity/'+params.entity_id+'/roles/'+params.role_id
      var method='delete'
      console.log('***** deleteRole ROLE ****')
      var headers = {
        Authorization : process.env.JWT_TOKEN
      }
      Helpers.makeURIRequestWithBody(uri, method,data,headers)
      .then((response)=>{
        resolve(response.body)
      }).catch((response)=>{
        reject()
      })


    })
}
module.exports = {
createEntity:createEntity,
findDocument:findDocument,
updateDocumentOwner:updateDocumentOwner,
getDocument:getDocument,
addRole:addRole,
deleteRole:deleteRole,
unlinkDocument,
unlinkAllDocuments,
verifications : verificationsClient,
entities: entitiesClient,
documents: client
}
