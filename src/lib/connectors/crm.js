const Helpers = require('../helpers')

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

    var uri=process.env.CRM_URI+'/entity' + '?token=' + process.env.JWT_TOKEN
    var method='post'
    Helpers.makeURIRequestWithBody(uri, method,data)
    .then((response)=>{
      console.log('crm entity response')
      console.log(response.body)
        resolve(response.body.data.entity_id)
    }).catch((response)=>{
      console.log(response)
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

    var uri=process.env.CRM_URI+'/documentHeader/filter' + '?token=' + process.env.JWT_TOKEN
    var method='post'
    Helpers.makeURIRequestWithBody(uri, method,data)
    .then((response)=>{
      console.log('crm findDocument response')
      console.log(response.body)
        resolve(response.body)
    }).catch((response)=>{
      console.log(response)
      console.log('rejecting in crm.findDocument')
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

    var uri=process.env.CRM_URI+'/documentHeader/filter' + '?token=' + process.env.JWT_TOKEN
    var method='post'
    Helpers.makeURIRequestWithBody(uri, method,data)
    .then((response)=>{
      console.log('crm findDocument response')
      console.log(response.body)
        resolve(response.body)
    }).catch((response)=>{
      console.log(response)
      console.log('rejecting in crm.findDocument')
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
      var uri=process.env.CRM_URI+'/entity/'+data.entity_id+'/roles?token='+process.env.JWT_TOKEN
      var method='post'
      console.log('***** ADD ROLE ****')
      console.log(data)
      Helpers.makeURIRequestWithBody(uri, method,data)
      .then((response)=>{
        console.log('crm entity response')
        console.log(response.body)
        resolve(response.body)
      }).catch((response)=>{
        console.log(response)
        console.log('rejecting in crm.addRole')
        reject()
      })


    })
}

function deleteRole(params){
    return new Promise((resolve, reject) => {
      var data=params
      var uri=process.env.CRM_URI+'/entity/'+data.entity_id+'/roles/'+data.role_id+'?token='+process.env.JWT_TOKEN
      var method='delete'
      console.log('***** deleteRole ROLE ****')
      console.log(data)
      Helpers.makeURIRequestWithBody(uri, method,data)
      .then((response)=>{
        console.log('crm deleteRole response')
        console.log(response.body)
        resolve(response.body)
      }).catch((response)=>{
        console.log(response)
        console.log('rejecting in crm.deleteRole')
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
deleteRole:deleteRole

}
