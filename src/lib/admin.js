//TODO: Replace all API calls with http API calls to water service
const httpRequest = require('request').defaults({
  proxy: null,
  strictSSL: false
})
const Helpers = require('./helpers')
const View = require('./view')
const Session = require('./session')
const Idm = require('./connectors/idm')
const Crm = require('./connectors/crm')
const Water = require('./connectors/water')
const DB = require('./connectors/db')

const Permit = require('./connectors/permit');


// @TODO tidy up
const rp = require('request-promise-native').defaults({
    proxy:null,
    strictSSL :false
  });


function index(request, reply) {
  //view the admin index page
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  reply.view('water/admin/index', viewContext)
}

function permitIndex(request, reply) {
  //view the permit index page
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  reply.view('water/admin/permitIndex', viewContext)
}

function idmIndex(request, reply) {
  //view the idm index page
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  reply.view('water/admin/idmIndex', viewContext)
}

function waterIndex(request, reply) {
  //view the water index page
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  reply.view('water/admin/waterIndex', viewContext)
}



function regimes(request, reply) {
  //view the regimes page


  var uri = process.env.PERMIT_URI + 'regime'
  httpRequest(uri + '?token=' + process.env.JWT_TOKEN, (error, response, body) => {
    var viewContext = View.contextDefaults(request)
    viewContext.pageTitle = 'GOV.UK - Admin/Fields'
    viewContext.data = JSON.parse(body)
    viewContext.debug.regimes = viewContext.data
    reply.view('water/admin/regimes', viewContext)

  })

}

function regimeLicenceTypes(request, reply) {
  //view the regime licence types page
  var viewContext = {}

  var uri = process.env.PERMIT_URI + 'regime/' + request.params.regime_id + '/licencetype'
  console.log(uri)
  httpRequest(uri + '?token=' + process.env.JWT_TOKEN, (error, response, body) => {
    var viewContext = View.contextDefaults(request)
    console.log(body)
    viewContext.pageTitle = 'GOV.UK - Admin/Fields'
    viewContext.data = JSON.parse(body).data
    viewContext.regime_id = request.params.regime_id
    viewContext.debug.data = viewContext.data.data
    reply.view('water/admin/regimeLicenceTypes', viewContext)

  })
}

function regimeLicenceType(request, reply) {
  //view regime licence types page
  var viewContext = View.contextDefaults(request)
  var uri = process.env.PERMIT_URI + 'regime/' + request.params.regime_id + '/licencetype/' + request.params.type_id
  console.log(uri)
  httpRequest(uri + '?token=' + process.env.JWT_TOKEN, (error, response, body) => {
    console.log('got body')
    console.log(body)
    var data = JSON.parse(body)
    if (!data.data[0].attributedata) {
      data.data[0].attributedata = []
    }

    viewContext.debug.data = data.data
    viewContext.data = data.data
    viewContext.regime_id = request.params.regime_id
    viewContext.type_id = request.params.type_id

    httpRequest(uri + '?token=' + process.env.JWT_TOKEN, (error, response, body) => {
      viewContext.fields = JSON.parse(body)
      viewContext.debug.fields = viewContext.fields
      reply.view('water/admin/regimeLicenceType', viewContext)
    })
  })
}

//TODO: replace with http call to API and use 301...

function addFieldToregimeLicenceType(request, reply) {
  API.licencetype.createField(request, (data) => {
    reply('<script>location.href=\'/admin/regime/' + request.params.regime_id + '/licencetypes/' + request.params.type_id + '/\'</script>')
  })
}

function findlicence(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  reply.view('water/admin/search', viewContext)
}

function doFindlicence(request, reply) {
  Crm.findDocument(request.params.search).then((response) => {
    reply(response)
  })
}

async function viewlicence(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - View Licence Data'
  var {data,error} = await Permit.licences.findOne(request.params.licence_id)
    if(error){
      throw error
    }
    viewContext.licence = data
    viewContext.licence_id = data.licence_id
    reply.view('water/admin/viewlicenceData', viewContext)
}

async function viewLicenceRaw(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - View Licence Data'

  const Permit = require('./connectors/permit')
  Permit.getLicence(request.params.licence_id).then((licence) => {
    viewContext.licence = JSON.stringify(licence, null, 4)
    viewContext.licence_id = request.params.licence_id
    reply.view('water/admin/viewlicenceDataRAW', viewContext)
  })




}

function addShortcode(request, reply) {
  API.licence.addshortcode(request.params.licence_id, (res) => {
    reply.redirect('/admin/licence/' + request.params.licence_id)
  });

}

function users(request, reply) {
  console.log('requested users')
  var viewContext = View.contextDefaults(request)
  Idm.getUsers().then((users) => {
    var viewContext = View.contextDefaults(request)
    viewContext.pageTitle = 'GOV.UK - Admin/Fields'
    viewContext.users = users
    viewContext.debug.users = viewContext.users
    console.log('*** adminIndex ***')
    reply.view('water/admin/viewusers', viewContext)
  })
}


function createUser(request, reply) {
  console.log('requested create user')
  Idm.createUser(request.payload).then(() => {
    //also create CRM record
    var data = {};
    data.entity_nm = request.payload.user_name;
    data.entity_type = 'individual';
    data.entity_definition = "{}";
    Crm.createEntity(data).then((id) => {
      console.log(id)
    }).then(() => {
      users(request, reply)
    })
  })
}

function user (request, reply) {
  Idm.getUser({
    user_id: request.params.user_id
  }).then((user) => {
    const viewContext = View.contextDefaults(request);
    const viewUser = user;
    viewUser.user_data = JSON.stringify(user.user_data, null, 2);
    viewContext.pageTitle = 'GOV.UK - Admin/Fields';
    viewContext.user = viewUser;
    viewContext.user_id = request.params.user_id;
    viewContext.debug.users = viewContext.user;
    reply.view('water/admin/viewuser', viewContext);
  });
}

function crm(request, reply) {
  //view the admin page
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  console.log('*** crmIndex ***')
  reply.view('water/admin/crmIndex', viewContext)
}

function crmEntities(request, reply) {
  if (request.query.filter) {
    console.log("With FILTER " + request.query.filter)
  }
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'

  URI = process.env.CRM_URI + '/entity?filter=' + JSON.stringify({entity_type: request.query.entity_type}) + '&token=' + process.env.JWT_TOKEN
  httpRequest(URI, function(error, response, body) {
    var data = JSON.parse(body)
    viewContext.entities = data.data
    viewContext.pagination = Helpers.addPaginationDetail(data.pagination)
    console.log(viewContext)
    reply.view('water/admin/crmEntities', viewContext)

  })
}


function crmEntity(request, reply) {
  if (request.query.filter) {
    console.log("With FILTER " + request.query.filter)
  }
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'

  console.log('get entity')
  console.log('get associations')
  console.log('get documents')

  URI = process.env.CRM_URI + '/entity/' + request.params.entity_id + '?token=' + process.env.JWT_TOKEN
  httpRequest(URI, function(error, response, body) {
    console.log('response from ' + URI)
    console.log(body)
    var data = JSON.parse(body)
    data.data.entity = data.data.entity
    viewContext.entities = data.data
    viewContext.debug.entities = data



    console.log(viewContext)

    reply.view('water/admin/crmEntity', viewContext)


    console.log(viewContext)

  })
}

function crmNewRegime(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  reply.view('water/admin/crmNewRegime', viewContext)
}

function crmNewCompany(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  reply.view('water/admin/crmNewCompany', viewContext)
}

function crmNewIndividual(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  reply.view('water/admin/crmNewIndividual', viewContext)
}

function crmDoNewEntity(request, reply) {
  console.log(request.payload)
  var data = {};
  data.entity_nm = request.payload.entity_nm;
  data.entity_type = request.payload.entity_type;
  data.entity_definition = request.payload.entity_definition;
  Crm.createEntity(data).then((id) => {
    console.log(id)
    reply.redirect('/admin/crm/entities/' + id);
  })

}

function crmAllEntitiesJSON(request, reply) {
  URI = process.env.CRM_URI + '/entity?token=' + process.env.JWT_TOKEN
  httpRequest(URI, function(error, response, body) {
    console.log('response from ' + URI)
    console.log(body)
    var data = JSON.parse(body)
    return reply(data.data)
  })
}



function crmDocumentHeaders(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  Crm.findDocument(request.params.search).then((response) => {
    viewContext.permits = response.data
    viewContext.debug.permits = response.data
    reply.view('water/admin/crmDocumentHeaders', viewContext)
  })
}

function setDocumentOwner(request, reply) {
  console.log('set document owner')
  console.log('payload')
  console.log(request.payload)
  var params = {
    entity_id: request.payload.entity_id,
    document_id: request.params.document_id
  }
  console.log(params)
  Crm.updateDocumentOwner(params).then((res) => {
    console.log('got resolve')
    reply(res)
  }).catch((err) => {
    console.log('got reject')
    reply(err)
  })
}

function getDocument(request, reply) {
  var viewContext = View.contextDefaults(request)
  console.log('get document')
  console.log('document:')
  var params = {
    document_id: request.params.document_id
  }
  console.log(params)
  Crm.getDocument(params).then((res) => {

    viewContext.document_id = request.params.document_id
    viewContext.document = res
    viewContext.debug.document = res
    reply.view('water/admin/crmDocument', viewContext)
  })
}

/**
 * Unlink document from company/verification
 * Redirects to document list
 */
async function getUnlinkDocument(request, reply) {
    const {error, rowCount} = await Crm.unlinkDocument(request.params.document_id);
    if(error) {
      throw error;
    }
    return reply.redirect('/admin/crm/document/unlink-success?count=' + rowCount);
 }

 /**
  * Unlink all documents from company/verification
  * Redirects to document list
  */
async function getUnlinkAllDocuments(request, reply) {
  const {error, rowCount} = await Crm.unlinkAllDocuments();
  if(error) {
    throw error;
  }
  return reply.redirect('/admin/crm/document/unlink-success?rowCount=' + rowCount);
}


/**
 * Success page when unlinking is complete
 * @param {String} request.query.rowCount - the number of rows updated by previous query
 */
function getUnlinkSuccess(request, reply) {
  var viewContext = View.contextDefaults(request);
  viewContext.rowCount = request.query.rowCount;
  reply.view('water/admin/crmUnlinkDocumentSuccess', viewContext)
}

async function crmGetVerifications(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  const {error, data} = await Crm.verifications.findMany();
  if(error) {
    throw error;
  }
  viewContext.verifications = data;
  viewContext.debug.verifications = data;
  reply.view('water/admin/crmVerifications', viewContext)
}

function updateUser(request, reply) {
  Idm.updateUser(request.params.user_id, request.payload).then((res) => {
    return reply.redirect(`/admin/idm/users/${request.params.user_id}`);
  }).catch((e) => {
    return reply(e)
  })
}

function loadLicences(request, reply) {
  var licenceRows = [];
  var csv = require("fast-csv");
  var CSV_STRING = request.payload.data
  csv
    .fromString(CSV_STRING, {
      headers: true,
      delimiter: '\t'
    })
    .on("data", function(data) {
      licenceRows.push(data)
    })
    .on("end", function() {
      var normalisedLicenceData = normalise(licenceRows);
      for (var i = 0; i < normalisedLicenceData.length; i++) {
        exportLicence(normalisedLicenceData[i], process.env.licenceRegimeId, process.env.licenceTypeId)
      }
      return reply(normalisedLicenceData)
    });
}

function createLicence(licenceRow) {
  return {
    id: licenceRow["Licence No."],
    wa_licence_type: licenceRow["Water Act Licence Type"],
    wa_desc: licenceRow["WA Lic. Type Description"],
    version_start: licenceRow["Version Start Date"],
    salutation: licenceRow["Salutation"],
    initials: licenceRow["Initials"],
    forename: licenceRow["Forename"],
    name: licenceRow["Name"],
    addressLine1: licenceRow["Line 1"],
    addressLine2: licenceRow["Line 2"],
    addressLine3: licenceRow["Line 3"],
    addressLine4: licenceRow["Line 4"],
    town: licenceRow["Town"],
    county: licenceRow["County"],
    country: licenceRow["Country"],
    postCode: licenceRow["Postcode"],
    maxAnnualQuantity: licenceRow["Max Annual Quantity"],
    maxDailyQuantity: licenceRow["Max Daily Quantity"],
    sourceOfSupply: licenceRow["Point Name"],
    effectiveFrom: licenceRow["Orig. Effective Date"],
    effectiveTo: licenceRow["Expiry Date"] ? licenceRow["Expiry Date"] : "No expiry",
    purposes: []
  }
}

function createPurpose(licenceRow) {
  return {
    id: licenceRow["Purpose ID"],
    primaryCode: licenceRow["Primary Code"],
    secondaryCode: licenceRow["Secondary Code"],
    useCode: licenceRow["Use Code"],
    annualQuantity: licenceRow["Annual Qty"],
    dailyQuantity: licenceRow["Daily Qty"],
    hourlyQuantity: licenceRow["Hourly Qty"],
    instantQuantity: licenceRow["Inst Qty"],
    description: licenceRow["Use Description"],
    periodStart: licenceRow["Period Start"],
    periodEnd: licenceRow["Period End"],
    meansOfMeasurement: licenceRow["MoM Description"],
    points: [],
    conditions: []
  }
}

function createPoint(licenceRow) {
  return {
    id: licenceRow["Point ID"],
    name: licenceRow["Point Name"],
    ngr1: licenceRow["NGR 1"],
    ngr2: licenceRow["NGR 2"],
    ngr3: licenceRow["NGR 3"],
    ngr4: licenceRow["NGR 4"],
    meansOfAbstraction: licenceRow["MoA Description"]
  }
}

function createCondition(licenceRow) {
  return {
    code: licenceRow["Code"],
    subCode: licenceRow["Sub Code"],
    parameter1: licenceRow["1st Parameter"],
    parameter2: licenceRow["2nd Parameter"],
    text: licenceRow["Text"]
  }
}

function getById(array, id) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].id === id) {
      return array[i]
    }
  }

  return undefined
}

function normalise(licenceRows) {
  var licences = []
  var purposes = []
  var points = []

  for (var i = 0; i < licenceRows.length; i++) {
    var licenceRow = licenceRows[i]

    // Get or create licence
    var licenceId = licenceRow["Licence No."]
    var licence = getById(licences, licenceId)
    if (licence === undefined) {
      licence = createLicence(licenceRow)
      licences.push(licence);

    }

    // Get or create purpose
    var purposeId = licenceRow["Purpose ID"]
    var purpose = getById(licence.purposes, purposeId)
    if (purpose === undefined) {
      purpose = purposes[purposeId]
      if (purpose === undefined) {
        purpose = createPurpose(licenceRow)
        purposes[purposeId] = purpose
      }

      licence.purposes.push(purpose)
    }

    // Get or create point
    var pointId = licenceRow["Point ID"]
    var point = getById(purpose.points, pointId)
    if (point === undefined) {
      point = points[pointId]
      if (point === undefined) {
        point = createPoint(licenceRow)
        points[pointId] = point
      }

      purpose.points.push(point)
    }

    var condition = createCondition(licenceRow);
    purpose.conditions.push(condition)
  }

  return licences
}






async function exportLicence(licence, orgId, licenceTypeId) {



  var requestBody = {
    licence_ref: licence.id,
    licence_start_dt: "2017-01-01T00:00:00.000Z",
    licence_end_dt: "2018-01-01T00:00:00.000Z",
    licence_status_id: "1",
    licence_type_id: licenceTypeId,
    licence_regime_id: orgId,
    licence_data_value:  JSON.stringify(licence)
  }





    delete requestBody.regime_id;
    var {data, error} = await Permit.licences.create(requestBody)
    if(error){
      throw error
    }

    var permitData=data;
    console.log(permitData)

    console.log(`Added ${licence.name} to Permit repo`);
    var data = {}
    data.regime_entity_id = '0434dc31-a34e-7158-5775-4694af7a60cf'

    data.system_id = 'permit-repo'
    data.system_internal_id = permitData.licence_id
    data.system_external_id = licence.id

    // Get metadata
    data.metadata = JSON.stringify({
       Name : licence.name,
       Salutation : licence.salutation,
       AddressLine1 : licence.addressLine1,
       AddressLine2 : licence.addressLine2,
       AddressLine3 : licence.addressLine3,
       AddressLine4 : licence.addressLine4,
       Town : licence.town,
       County : licence.county,
       Postcode : licence.postCode,
       Country : licence.country})

    return rp({
      method : 'POST',
      uri : process.env.CRM_URI + '/documentHeader',
      headers : {
        Authorization : process.env.JWT_TOKEN
      },
      body : data,
      json : true
    }).then((res) => {

      console.log('Added '+res.data.system_external_id+'to CRM');
      return true
    }).catch((err) => {
      console.log('Error adding to CRM');
      console.log(err);
      return err
    });



  return
}


function loadLicencesUI(request, reply) {
  //view the admin page
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  console.log('*** adminIndex ***')
  reply.view('water/admin/import', viewContext)
}

function addRole(request, reply) {



  console.log(request.payload)
  var data = {};
  data.entity_id = request.params.entity_id
  data.role = request.payload.role;
  data.regime_entity_id = request.payload.regime;
  data.company_entity_id = request.payload.company;
  if (request.payload.is_primary) {
    data.is_primary = 1
  } else {
    data.is_primary = 0
  }
  Crm.addRole(data).then(() => {
    console.log()
    reply({});
  })
}

function deleteRole(request, reply) {
  console.log(request.payload)
  var data = {};
  data.entity_id = request.params.entity_id
  data.role_id = request.params.role_id;
  Crm.deleteRole(data).then(() => {
    reply({});
  })
}

async function stats(request,reply){
  var users=Idm.getUsers()
//      TODO: update stats
      var stats={loggedin:{users:[],domains:[]},notloggedin:{users:[],domains:[]}}
      for(userRef in users){
        var user=users[userRef]
        if(user.last_login != null){
          status="loggedin"
        } else {
          status="notloggedin"
        }
        stats[status].users.push(user.user_name)
        var domain=user.user_name.split('@')[1].trim()
        if(!stats[status].domains[domain]){
          stats[status].domains[domain]=[]
        }
        stats[status].domains[domain].push(user.user_name)
      }
      return reply(stats)
}

function naldImport(request,reply){
Water.naldImport().then((res)=>{
  return reply (res)
}).catch((res)=>{
  return reply ({error:res})
})
}


function naldLicence(request,reply){
  console.log('requesting naldLicence')
  Water.naldLicence(request.query.licence_number).then((res)=>{
  return reply (res)
}).catch((res)=>{
  console.log(res)
  return reply ({error:res})
})
}

function fields(request,reply){
  reply()
}

module.exports = {
  index,
  fields,
  regimes,
  regimeLicenceTypes,
  regimeLicenceType,
  addFieldToregimeLicenceType,
  findlicence,
  doFindlicence,
  viewlicence,
  addShortcode,
  users,
  user,
  createUser,
  crm,
  crmEntities,
  crmEntity,
  crmNewRegime,
  crmNewCompany,
  crmNewIndividual,
  crmDoNewEntity,
  crmAllEntitiesJSON,
  permitIndex,
  crmDocumentHeaders,
  setDocumentOwner,
  crmGetVerifications,
  idmIndex,
  waterIndex,
  getDocument,
  getUnlinkDocument,
  getUnlinkAllDocuments,
  getUnlinkSuccess,
  updateUser,
  loadLicences,
  loadLicencesUI,
  viewLicenceRaw,
  addRole,
  deleteRole,
  stats,
  naldImport,
  naldLicence
};
