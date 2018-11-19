const controller = require('./controller');

module.exports = {
  getSearch: {
    method: 'GET',
    path: '/admin/repair-returns',
    handler: controller.getSearch
  },
  postSearch: {
    method: 'POST',
    path: '/admin/repair-returns',
    handler: controller.postSearch
  },
  postSubmit: {
    method: 'POST',
    path: '/admin/repair-returns/submit',
    handler: controller.postSubmit
  }
};
