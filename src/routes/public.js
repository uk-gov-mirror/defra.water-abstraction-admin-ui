module.exports = [
  {
    method: 'GET',
    path: '/admin/public/{param*}',
    config: {
      auth: false
    },
    handler: {
      directory: {
        path: 'public/',
        listing: true
      }
    }
  }
];
