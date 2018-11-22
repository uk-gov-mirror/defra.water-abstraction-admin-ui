// TODO: Replace all API calls with http API calls to water service
const httpRequest = require('request').defaults({
  proxy: null,
  strictSSL: false
});
const helpers = require('./helpers');
const View = require('./view');
const Idm = require('./connectors/idm');
const Crm = require('./connectors/crm');
const Water = require('./connectors/water');
const Permit = require('./connectors/permit');
const { get } = require('lodash');
const config = require('../../config');

const rp = require('request-promise-native').defaults({
  proxy: null,
  strictSSL: false
});

function index (request, reply) {
  // View the admin index page
  var viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  reply.view('water/admin/index', viewContext);
}

function permitIndex (request, reply) {
  // view the permit index page
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  reply.view('water/admin/permitIndex', viewContext);
}

function idmIndex (request, reply) {
  // view the idm index page
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  reply.view('water/admin/idmIndex', viewContext);
}

function waterIndex (request, reply) {
  // view the water index page
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  reply.view('water/admin/waterIndex', viewContext);
}

function regimes (request, reply) {
  // view the regimes page
  const uri = process.env.PERMIT_URI + 'regime';

  httpRequest(uri + '?token=' + process.env.JWT_TOKEN, (error, response, body) => {
    if (error) {
      console.log(error);
    }

    const viewContext = View.contextDefaults(request);
    viewContext.pageTitle = 'GOV.UK - Admin/Fields';
    viewContext.data = JSON.parse(body);
    viewContext.debug.regimes = viewContext.data;
    reply.view('water/admin/regimes', viewContext);
  });
}

function regimeLicenceTypes (request, reply) {
  // view the regime licence types page
  const uri = process.env.PERMIT_URI + 'regime/' + request.params.regime_id + '/licencetype';

  httpRequest(uri + '?token=' + process.env.JWT_TOKEN, (error, response, body) => {
    if (error) {
      console.error(error);
    }

    const viewContext = View.contextDefaults(request);
    viewContext.pageTitle = 'GOV.UK - Admin/Fields';
    viewContext.data = JSON.parse(body).data;
    viewContext.regime_id = request.params.regime_id;
    viewContext.debug.data = get(viewContext, 'data.data');
    reply.view('water/admin/regimeLicenceTypes', viewContext);
  });
}

function regimeLicenceType (request, reply) {
  // view regime licence types page
  const viewContext = View.contextDefaults(request);
  const uri = process.env.PERMIT_URI + 'regime/' + request.params.regime_id + '/licencetype/' + request.params.type_id;

  httpRequest(uri + '?token=' + process.env.JWT_TOKEN, (error, response, body) => {
    if (error) {
      console.log(error);
    }

    const data = JSON.parse(body);
    if (!data.data[0].attributedata) {
      data.data[0].attributedata = [];
    }

    viewContext.debug.data = data.data;
    viewContext.data = data.data;
    viewContext.regime_id = request.params.regime_id;
    viewContext.type_id = request.params.type_id;

    httpRequest(uri + '?token=' + process.env.JWT_TOKEN, (error, response, body) => {
      if (error) {
        console.log(error);
      }

      viewContext.fields = JSON.parse(body);
      viewContext.debug.fields = viewContext.fields;
      reply.view('water/admin/regimeLicenceType', viewContext);
    });
  });
}

function findlicence (request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  reply.view('water/admin/search', viewContext);
}

function doFindlicence (request, reply) {
  Crm.findDocument(request.params.search).then((response) => {
    reply(response);
  });
}

async function viewlicence (request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - View Licence Data';
  const {data, error} = await Permit.licences.findOne(request.params.licence_id);
  if (error) {
    throw error;
  }
  viewContext.licence = data;
  viewContext.licence_id = data.licence_id;
  reply.view('water/admin/viewlicenceData', viewContext);
}

async function viewLicenceRaw (request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - View Licence Data';

  const Permit = require('./connectors/permit');
  Permit.getLicence(request.params.licence_id).then((licence) => {
    viewContext.licence = JSON.stringify(licence, null, 4);
    viewContext.licence_id = request.params.licence_id;
    reply.view('water/admin/viewlicenceDataRAW', viewContext);
  });
}

function crm (request, reply) {
  // view the admin page
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  reply.view('water/admin/crmIndex', viewContext);
}

function crmEntities (request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  const URI = process.env.CRM_URI + '/entity?filter=' + JSON.stringify({entity_type: request.query.entity_type}) + '&token=' + process.env.JWT_TOKEN;
  httpRequest(URI, function (error, response, body) {
    if (error) {
      console.log(error);
    }

    const data = JSON.parse(body);
    viewContext.entities = data.data;
    viewContext.pagination = helpers.addPaginationDetail(data.pagination);
    reply.view('water/admin/crmEntities', viewContext);
  });
}

async function crmEntity (request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';

  const { entity_id: entityId } = request.params;

  const { data: entity } = await Crm.entities.findOne(entityId);

  const { data: entityRoles } = await Crm.entityRoles.setParams({entity_id: entityId}).findMany();

  reply.view('water/admin/crmEntity', {
    ...viewContext,
    entity,
    entityRoles
  });
}

function crmNewRegime (request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  reply.view('water/admin/crmNewRegime', viewContext);
}

function crmNewCompany (request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  reply.view('water/admin/crmNewCompany', viewContext);
}

function crmNewIndividual (request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  reply.view('water/admin/crmNewIndividual', viewContext);
}

function crmDoNewEntity (request, reply) {
  console.log(request.payload);
  const data = {};
  data.entity_nm = request.payload.entity_nm;
  data.entity_type = request.payload.entity_type;
  data.entity_definition = request.payload.entity_definition;
  Crm.createEntity(data).then((id) => {
    console.log(id);
    reply.redirect('/admin/crm/entities/' + id);
  });
}

function crmAllEntitiesJSON (request, reply) {
  const URI = process.env.CRM_URI + '/entity?token=' + process.env.JWT_TOKEN;
  httpRequest(URI, function (error, response, body) {
    if (error) {
      console.error(error);
    }
    console.log('response from ' + URI);
    console.log(body);
    const data = JSON.parse(body);
    return reply(data.data);
  });
}

function crmDocumentHeaders (request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  viewContext.allowUnlinkAll = helpers.showUnlinkAll(process.env);
  Crm.findDocument(request.params.search).then((response) => {
    viewContext.permits = response.data;
    viewContext.debug.permits = response.data;
    reply.view('water/admin/crmDocumentHeaders', viewContext);
  });
}

function setDocumentOwner (request, reply) {
  const params = {
    entity_id: request.payload.entity_id,
    document_id: request.params.document_id
  };
  Crm.updateDocumentOwner(params).then((res) => {
    reply(res);
  }).catch((err) => {
    console.error(err);
    reply(err);
  });
}

function getDocument (request, reply) {
  const viewContext = View.contextDefaults(request);
  const params = { document_id: request.params.document_id };
  Crm.getDocument(params).then((res) => {
    viewContext.document_id = request.params.document_id;
    viewContext.document = res;
    viewContext.debug.document = res;
    reply.view('water/admin/crmDocument', viewContext);
  });
}

/**
 * Unlink document from company/verification
 * Redirects to document list
 */
async function getUnlinkDocument (request, reply) {
  const {error, rowCount} = await Crm.unlinkDocument(request.params.document_id);
  if (error) {
    throw error;
  }
  return reply.redirect('/admin/crm/document/unlink-success?count=' + rowCount);
}

 /**
  * Unlink all documents from company/verification
  * Redirects to document list
  */
async function getUnlinkAllDocuments (request, reply) {
  const {error, rowCount} = await Crm.unlinkAllDocuments();
  if (error) {
    throw error;
  }
  return reply.redirect('/admin/crm/document/unlink-success?rowCount=' + rowCount);
}

/**
 * Success page when unlinking is complete
 * @param {String} request.query.rowCount - the number of rows updated by previous query
 */
function getUnlinkSuccess (request, reply) {
  var viewContext = View.contextDefaults(request);
  viewContext.rowCount = request.query.rowCount;
  reply.view('water/admin/crmUnlinkDocumentSuccess', viewContext);
}

async function crmGetVerifications (request, reply) {
  var viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  const {error, data} = await Crm.verifications.findMany();
  if (error) {
    throw error;
  }
  viewContext.verifications = data;
  viewContext.debug.verifications = data;
  reply.view('water/admin/crmVerifications', viewContext);
}

function loadLicences (request, reply) {
  var licenceRows = [];
  var csv = require('fast-csv');
  var CSV_STRING = request.payload.data;
  csv
    .fromString(CSV_STRING, {
      headers: true,
      delimiter: '\t'
    })
    .on('data', function (data) {
      licenceRows.push(data);
    })
    .on('end', function () {
      var normalisedLicenceData = normalise(licenceRows);
      for (var i = 0; i < normalisedLicenceData.length; i++) {
        exportLicence(normalisedLicenceData[i], config.licence.regimeId, config.licence.typeId);
      }
      return reply(normalisedLicenceData);
    });
}

function createLicence (licenceRow) {
  return {
    id: licenceRow['Licence No.'],
    wa_licence_type: licenceRow['Water Act Licence Type'],
    wa_desc: licenceRow['WA Lic. Type Description'],
    version_start: licenceRow['Version Start Date'],
    salutation: licenceRow['Salutation'],
    initials: licenceRow['Initials'],
    forename: licenceRow['Forename'],
    name: licenceRow['Name'],
    addressLine1: licenceRow['Line 1'],
    addressLine2: licenceRow['Line 2'],
    addressLine3: licenceRow['Line 3'],
    addressLine4: licenceRow['Line 4'],
    town: licenceRow['Town'],
    county: licenceRow['County'],
    country: licenceRow['Country'],
    postCode: licenceRow['Postcode'],
    maxAnnualQuantity: licenceRow['Max Annual Quantity'],
    maxDailyQuantity: licenceRow['Max Daily Quantity'],
    sourceOfSupply: licenceRow['Point Name'],
    effectiveFrom: licenceRow['Orig. Effective Date'],
    effectiveTo: licenceRow['Expiry Date'] ? licenceRow['Expiry Date'] : 'No expiry',
    purposes: []
  };
}

function createPurpose (licenceRow) {
  return {
    id: licenceRow['Purpose ID'],
    primaryCode: licenceRow['Primary Code'],
    secondaryCode: licenceRow['Secondary Code'],
    useCode: licenceRow['Use Code'],
    annualQuantity: licenceRow['Annual Qty'],
    dailyQuantity: licenceRow['Daily Qty'],
    hourlyQuantity: licenceRow['Hourly Qty'],
    instantQuantity: licenceRow['Inst Qty'],
    description: licenceRow['Use Description'],
    periodStart: licenceRow['Period Start'],
    periodEnd: licenceRow['Period End'],
    meansOfMeasurement: licenceRow['MoM Description'],
    points: [],
    conditions: []
  };
}

function createPoint (licenceRow) {
  return {
    id: licenceRow['Point ID'],
    name: licenceRow['Point Name'],
    ngr1: licenceRow['NGR 1'],
    ngr2: licenceRow['NGR 2'],
    ngr3: licenceRow['NGR 3'],
    ngr4: licenceRow['NGR 4'],
    meansOfAbstraction: licenceRow['MoA Description']
  };
}

function createCondition (licenceRow) {
  return {
    code: licenceRow['Code'],
    subCode: licenceRow['Sub Code'],
    parameter1: licenceRow['1st Parameter'],
    parameter2: licenceRow['2nd Parameter'],
    text: licenceRow['Text']
  };
}

function getById (array, id) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].id === id) {
      return array[i];
    }
  }
}

function normalise (licenceRows) {
  var licences = [];
  var purposes = [];
  var points = [];

  for (var i = 0; i < licenceRows.length; i++) {
    var licenceRow = licenceRows[i];

    // Get or create licence
    var licenceId = licenceRow['Licence No.'];
    var licence = getById(licences, licenceId);
    if (licence === undefined) {
      licence = createLicence(licenceRow);
      licences.push(licence);
    }

    // Get or create purpose
    var purposeId = licenceRow['Purpose ID'];
    var purpose = getById(licence.purposes, purposeId);
    if (purpose === undefined) {
      purpose = purposes[purposeId];
      if (purpose === undefined) {
        purpose = createPurpose(licenceRow);
        purposes[purposeId] = purpose;
      }

      licence.purposes.push(purpose);
    }

    // Get or create point
    var pointId = licenceRow['Point ID'];
    var point = getById(purpose.points, pointId);
    if (point === undefined) {
      point = points[pointId];
      if (point === undefined) {
        point = createPoint(licenceRow);
        points[pointId] = point;
      }

      purpose.points.push(point);
    }

    var condition = createCondition(licenceRow);
    purpose.conditions.push(condition);
  }

  return licences;
}

async function exportLicence (licence, orgId, licenceTypeId) {
  const requestBody = {
    licence_ref: licence.id,
    licence_start_dt: '2017-01-01T00:00:00.000Z',
    licence_end_dt: '2018-01-01T00:00:00.000Z',
    licence_status_id: '1',
    licence_type_id: licenceTypeId,
    licence_regime_id: orgId,
    licence_data_value: JSON.stringify(licence)
  };

  var {data, error} = await Permit.licences.create(requestBody);
  if (error) {
    throw error;
  }

  const permitData = data;
  console.log(permitData);

  console.log(`Added ${licence.name} to Permit repo`);
  data.regime_entity_id = '0434dc31-a34e-7158-5775-4694af7a60cf';

  data.system_id = 'permit-repo';
  data.system_internal_id = permitData.licence_id;
  data.system_external_id = licence.id;

  // Get metadata
  data.metadata = JSON.stringify({
    Name: licence.name,
    Salutation: licence.salutation,
    AddressLine1: licence.addressLine1,
    AddressLine2: licence.addressLine2,
    AddressLine3: licence.addressLine3,
    AddressLine4: licence.addressLine4,
    Town: licence.town,
    County: licence.county,
    Postcode: licence.postCode,
    Country: licence.country});

  return rp({
    method: 'POST',
    uri: process.env.CRM_URI + '/documentHeader',
    headers: {
      Authorization: process.env.JWT_TOKEN
    },
    body: data,
    json: true
  }).then((res) => {
    console.log(`Added ${res.data.system_external_id}  to CRM`);
    return true;
  }).catch((err) => {
    console.log('Error adding to CRM');
    console.log(err);
    return err;
  });
}

function loadLicencesUI (request, reply) {
  // view the admin page
  var viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  console.log('*** adminIndex ***');
  reply.view('water/admin/import', viewContext);
}

function addRole (request, reply) {
  const { role, regime, company } = request.payload;
  const data = {
    entity_id: request.params.entity_id,
    role,
    regime_entity_id: regime,
    company_entity_id: company
  };

  Crm.addRole(data).then(() => reply({}));
}

async function deleteRole (request, reply) {
  const data = {
    entity_id: request.params.entity_id,
    role_id: request.params.role_id
  };
  await Crm.deleteRole(data);
  return reply.redirect(`/admin/crm/entities/${request.params.entity_id}`);
}

async function stats (request, reply) {
  const users = await Idm.getUsers();
  const stats = {
    loggedin: { users: [], domains: [] },
    notloggedin: {users: [], domains: []
    }
  };

  users.forEach(user => {
    const status = (user.last_login !== null) ? 'loggedin' : 'notloggedin';
    stats[status].users.push(user.user_name);
    const domain = user.user_name.split('@')[1].trim();
    if (!stats[status].domains[domain]) {
      stats[status].domains[domain] = [];
    }
    stats[status].domains[domain].push(user.user_name);
  });
  return reply(stats);
}

function naldImport (request, reply) {
  Water.naldImport().then((res) => {
    return reply(res);
  }).catch((res) => {
    return reply({error: res});
  });
}

function naldLicence (request, reply) {
  console.log('requesting naldLicence');
  Water.naldLicence(request.query.licence_number).then((res) => {
    return reply(res);
  }).catch((res) => {
    console.log(res);
    return reply({error: res});
  });
}

module.exports = {
  index,
  regimes,
  regimeLicenceTypes,
  regimeLicenceType,
  findlicence,
  doFindlicence,
  viewlicence,
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
  loadLicences,
  loadLicencesUI,
  viewLicenceRaw,
  addRole,
  deleteRole,
  stats,
  naldImport,
  naldLicence
};
