const Session = require('./session');

function viewContextDefaults (request) {
  var viewContext = {};

  viewContext.session = Session.get(request);
  viewContext.uiBaseUrl = process.env.BASE_URL;

  console.log('VIEW CONTEXT SESSION');
  console.log(viewContext.session);

  viewContext.pageTitle = 'Water Abstraction';
  viewContext.insideHeader = '';
  viewContext.headerClass = 'with-proposition';
  viewContext.topOfPage = null;
  viewContext.head = '<meta name="robots" content="noindex, nofollow">';
  viewContext.bodyStart = null;
  viewContext.afterHeader = null;
  viewContext.path = request.path;
  viewContext.debug = {};
  viewContext.debug.request = request.info;
  viewContext.debug.request.path = request.path;
  viewContext.debug.session = request.yar.get('sessionTimestamp');
  return viewContext;
}

module.exports = {
  contextDefaults: viewContextDefaults
};
