const Helpers = require('../helpers')


function getUsers(){
  return new Promise((resolve, reject) => {
    var uri=process.env.IDM_URI + '/user'+ '?token=' + process.env.JWT_TOKEN
    var method='get'
    Helpers.makeURIRequest(uri, method)
    .then((response)=>{
      console.log('user response')
      console.log(response.body)
        resolve(JSON.parse(response.body))
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
        resolve(JSON.parse(response.body))
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
    var uri=process.env.IDM_URI + '/user'+ '?token=' + process.env.JWT_TOKEN
    var method='POST'
      console.log('user data')
      console.log(data.user_data)
    Helpers.makeURIRequestWithBody(uri, method,data)
    .then((response)=>{
      console.log('user response')
      console.log(response.body)
        resolve(response.body)
    }).catch((response)=>{
      console.log(response)
      console.log('rejecting in idm.getUsers')
      reject(response)
    })


  });

}

function updateUser (user_id, payload) {
  return new Promise((resolve, reject) => {
//  console.log("Change password: " + username + " " + password)
    var data = payload
    var uri = `${process.env.IDM_URI}/user/${user_id}?token=${process.env.JWT_TOKEN}`
    Helpers.makeURIRequestWithBody(uri,'PATCH', data)
    .then((response)=>{
        resolve(response)
    }).catch((response)=>{
//      console.log('rejecting in idm.updatePassword')
      reject(response)
    })
  });
}

module.exports = {
getUsers,
getUser,
createUser,
updateUser


}
