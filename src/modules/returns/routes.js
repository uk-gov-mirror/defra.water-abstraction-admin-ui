const controller = require('./controller');

module.exports = {
  getReturnsSearch: {
    method: 'GET',
    path: '/admin/returns',
    handler: controller.getReturnsSearch,
    config: {

    }
  },

  getLogsList: {
    method: 'GET',
    path: '/admin/returns/logs/{regionCode}/{formatId}',
    handler: controller.getLogsList,
    config: {

    }
  },

  getLinesList: {
    method: 'GET',
    path: '/admin/returns/lines/{regionCode}/{formatId}/{day}/{month}/{year}',
    handler: controller.getLinesList,
    config: {

    }
  }
};
