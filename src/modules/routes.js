const returnsRoutes = require('./returns/routes');
const returnsNotificationRoutes = require('./returns-notifications/routes');
const picklistRoutes = require('./picklists/routes');
const returnsRepairRoutes = require('./returns-repair/routes');

const routes = [
  ...Object.values(returnsRoutes),
  ...Object.values(returnsNotificationRoutes),
  ...Object.values(picklistRoutes),
  ...Object.values(returnsRepairRoutes)
];

module.exports = routes;
