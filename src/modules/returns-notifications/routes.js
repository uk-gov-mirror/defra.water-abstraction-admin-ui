const controller = require('./controller');

module.exports = {
  getReturnsNotifications: {
    method: 'GET',
    path: '/admin/returns-notifications/invitation',
    handler: controller.getReturnInvitation
  },

  postReturnsNotifications: {
    method: 'POST',
    path: '/admin/returns-notifications/invitation',
    handler: controller.postReturnInvitation
  },

  postReturnInvitationSend: {
    method: 'POST',
    path: '/admin/returns-notifications/invitation/send',
    handler: controller.postReturnInvitationSend
  }
};
