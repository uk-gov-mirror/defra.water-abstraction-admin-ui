const Helpers = require('../helpers')



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
  }).catch((response)=>{
    console.log(response)
    console.log('rejecting in crm.createEntity')
    reject()
  })
})
}

module.exports = {
createEntity:createEntity,
findDocument:findDocument,
updateDocumentOwner:updateDocumentOwner

}
