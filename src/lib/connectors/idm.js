const Helpers = require('../helpers')

const {APIClient} = require('hapi-pg-rest-api');
const rp = require('request-promise-native').defaults({
    proxy:null,
    strictSSL :false
  })


function getUsers(){
  return new Promise((resolve, reject) => {
    var uri=process.env.IDM_URI + '/user'
    var method='get'
    Helpers.makeURIRequest(uri, method)
    .then((response)=>{
      console.log('--- user response ---')
      console.log(JSON.parse(response.body).data)
      resolve(JSON.parse(response.body).data)
    }).catch((response)=>{
      console.log(response)
      console.log('rejecting in idm.getUsers')
      reject(response)
    })

  });

}

function getUser(params){
  console.log(params)
  return new Promise((resolve, reject) => {
    var uri=process.env.IDM_URI + '/user/'+params.user_id+ '?token=' + process.env.JWT_TOKEN
    var method='get'
    Helpers.makeURIRequest(uri, method)
    .then((response)=>{
      console.log('user response')
      console.log(response.body)
        resolve(JSON.parse(response.body).data)
    }).catch((response)=>{
      console.log(response)
      console.log('rejecting in idm.getUser')
      reject(response)
    })

  });

}

function createUser(data){
  /**
  request.payload.username, hashedPW,
  request.payload.admin,
  JSON.stringify(request.payload.user_data),Helpers.createGUID(),1]

  **/
  return new Promise((resolve, reject) => {
    console.log('Create user called')
    console.log(data)
    var uri=process.env.IDM_URI + '/user'
    var method='POST'
      console.log('user data')
      console.log(data.user_data)
    Helpers.makeURIRequestWithBody(uri, method,data)
    .then((response)=>{
      console.log('user response')
      console.log(response.body)
        resolve(response.body)
    }).catch((response)=>{
      console.log(response.error.error)
      console.log('rejecting in idm.getUsers')
      reject(response)
    })


  });

}

function updateUser (user_id, payload) {
  return new Promise((resolve, reject) => {
//  console.log("Change password: " + username + " " + password)
    var data = payload
    console.log('updateUser')
    console.log(data.reset_guid.length)
    console.log('check guid')
    if(data.reset_guid.length==0){
        delete data.reset_guid
    }
    if(data.reset_required.length==0){
        data.reset_required=0
    }
    if(data.bad_logins.length==0){
        data.bad_logins=0
    }
    console.log(data)
    var uri = `${process.env.IDM_URI}/user/${user_id}`
    Helpers.makeURIRequestWithBody(uri,'PATCH', data)
    .then((response)=>{
        resolve(response)
    }).catch((response)=>{
      console.log('rejecting in idm.updatePassword')
      reject(response)
    })
  });
}


const usersClient = new APIClient(rp, {
  endpoint: `${ process.env.IDM_URI }/user`,
  headers : {
    Authorization : process.env.JWT_TOKEN
  }
});

module.exports = {
getUsers,
getUser,
createUser,
updateUser,
users:usersClient,
usersClient


}
