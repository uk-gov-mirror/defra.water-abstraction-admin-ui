const returnsRoutes = require('./returns/routes');
const testMode = parseInt(process.env.test_mode);

let routes = [
  ...Object.values(returnsRoutes)
];

if (testMode) {
  const naldRoutes = require('./nald-poc/routes');
  routes = [
    ...routes,
    ...Object.values(naldRoutes)
  ];
}

module.exports = routes;
