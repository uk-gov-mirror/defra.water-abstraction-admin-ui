const Helpers = require('../helpers')

function naldImport() {
  console.log('requesting nald import')
  var uri = process.env.WATER_URI + '/nald/import?token=' + process.env.JWT_TOKEN
  console.log(uri)
  return new Promise((resolve, reject) => {
    Helpers.makeURIRequest(uri)
      .then((response) => {
        var data = JSON.parse(response.body)
        resolve(data)
      }).catch((response) => {
        reject(response)
      })
  });
}

function naldLicence(licence_number) {
  console.log('requesting nald licence')
  var uri = process.env.WATER_URI + '/nald/licence?token=' + process.env.JWT_TOKEN
  requestBody={licence_number:licence_number}

  console.log(uri)
  console.log(requestBody)
  return new Promise((resolve, reject) => {
    Helpers.makeURIRequestWithBody(
      uri,
      'post',
      requestBody)
      .then((response) => {
        var data = response.body
        resolve(data)
      }).catch((response) => {
        console.log(response)
        resolve(response)
      })
  });
}


async function getSchedules() {
  var uri = process.env.WATER_URI + '/scheduler'
  try{
    res = await Helpers.makeURIRequest(uri)
    return JSON.parse(res.body).data
  }catch(e){
    return null
  }

}

async function addSchedule(data) {
  console.log('requesting nald licence')
  var uri = process.env.WATER_URI + '/scheduler'
  console.log(uri)
  try{
    res = await Helpers.makeURIRequestWithBody(uri,"post",data)
    console.log('res.data')
    console.log(res.body)
    return JSON.parse(res.body).data
  }catch(e){
    console.log(e)
    return null
  }

}
module.exports = {
naldImport,
naldLicence,
getSchedules,
addSchedule

}
