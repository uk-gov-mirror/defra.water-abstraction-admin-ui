const returnsRoutes = require('./returns/routes');
const returnsNotificationRoutes = require('./returns-notifications/routes');
const returnsRepairRoutes = require('./returns-repair/routes');

const routes = [
  ...Object.values(returnsRoutes),
  ...Object.values(returnsNotificationRoutes),
  ...Object.values(returnsRepairRoutes)
];

module.exports = routes;
