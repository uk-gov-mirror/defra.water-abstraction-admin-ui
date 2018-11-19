const returnsRoutes = require('./returns/routes');
const returnsNotificationRoutes = require('./returns-notifications/routes');
const picklistRoutes = require('./picklists/routes');
const returnsRepairRoutes = require('./returns-repair/routes');
const testMode = parseInt(process.env.test_mode);

let routes = [
  ...Object.values(returnsRoutes),
  ...Object.values(returnsNotificationRoutes),
  ...Object.values(picklistRoutes),
  ...Object.values(returnsRepairRoutes)
];

if (testMode) {
  const naldRoutes = require('./nald-poc/routes');
  routes = [
    ...routes,
    ...Object.values(naldRoutes)
  ];
}

module.exports = routes;
