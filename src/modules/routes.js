const returnsRoutes = require('./returns/routes');
const returnsNotificationRoutes = require('./returns-notifications/routes');
const testMode = parseInt(process.env.test_mode);

let routes = [
  ...Object.values(returnsRoutes),
  ...Object.values(returnsNotificationRoutes)
];

if (testMode) {
  const naldRoutes = require('./nald-poc/routes');
  routes = [
    ...routes,
    ...Object.values(naldRoutes)
  ];
}

module.exports = routes;
