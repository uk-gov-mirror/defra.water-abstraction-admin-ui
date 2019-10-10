const Session = require('./session');

const viewContextDefaults = request => ({
  session: Session.get(request),
  uiBaseUrl: process.env.BASE_URL,
  pageTitle: 'Water Abstraction',
  insideHeader: '',
  headerClass: 'with-proposition',
  topOfPage: null,
  head: '<meta name="robots" content="noindex, nofollow">',
  bodyStart: null,
  afterHeader: null,
  path: request.path
});

exports.contextDefaults = viewContextDefaults;
