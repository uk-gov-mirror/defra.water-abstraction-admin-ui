/*

API operations only - NO UI

*/

const API = require('../lib/API');
const version = '1.0';

module.exports = [
  { method: 'POST', path: '/API/' + version + '/org/{regime_id}/licencetype/{type_id}/licence/{licence_id}/shortcode', handler: API.shortcode.create },
  { method: 'POST', path: '/API/' + version + '/shortcode/{shortcode}', handler: API.shortcode.use },
  { method: 'POST', path: '/API/' + version + '/token', config: { auth: false }, handler: API.system.getToken },
  { method: 'GET', path: '/API/' + version + '/field', handler: API.system.getFields },
  { method: 'GET', path: '/API/' + version + '/org', handler: API.org.list },
  { method: 'POST', path: '/API/' + version + '/org', handler: API.org.create },
  { method: 'DELETE', path: '/API/' + version + '/org/{regime_id}', handler: API.org.delete },
  { method: 'GET', path: '/API/' + version + '/org/{regime_id}', handler: API.org.get },
  { method: 'PUT', path: '/API/' + version + '/org/{regime_id}', handler: API.org.update },
  { method: 'POST', path: '/API/' + version + '/org/{regime_id}/licencetype', handler: API.licencetype.create },
  { method: 'GET', path: '/API/' + version + '/org/{regime_id}/licencetype', handler: API.licencetype.list },
  { method: 'GET', path: '/API/' + version + '/org/{regime_id}/licencetype/{type_id}', handler: API.licencetype.get },
  { method: 'GET', path: '/API/' + version + '/org/{regime_id}/licencetype/{type_id}/field', handler: API.licencetype.getFields },
  { method: 'POST', path: '/API/' + version + '/org/{regime_id}/licencetype/{type_id}/field', handler: API.licencetype.createField },
  { method: 'GET', path: '/API/' + version + '/org/{regime_id}/licencetype/{type_id}/licence', handler: API.licence.list },
  { method: 'POST', path: '/API/' + version + '/org/{regime_id}/licencetype/{type_id}/licence', handler: API.licence.create },
  { method: 'GET', path: '/API/' + version + '/org/{regime_id}/licencetype/{type_id}/licence/{licence_id}', handler: API.licence.get },
  { method: 'PUT', path: '/API/' + version + '/org/{regime_id}/licencetype/{type_id}/licence/{licence_id}', handler: API.licence.update },
{ method: 'GET', path: '/API/' + version + '/reset', handler: API.general.reset }
];
