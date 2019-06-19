const serviceStatusController = require('../controllers/serviceStatus');

module.exports = [
  {
    method: 'GET',
    path: '/admin/service-status',
    handler: serviceStatusController.serviceStatus,
    config: {
      description: 'Service Status',
      auth: false
    }
  }
];
