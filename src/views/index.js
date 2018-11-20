const handlebars = require('handlebars');
const moment = require('moment');
const Helpers = require('../lib/helpers');

handlebars.registerHelper('equal', require('handlebars-helper-equal'));

handlebars.registerHelper('or', function (v1, v2, options) {
  if (v1 || v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

handlebars.registerHelper('plural', (count, singular, plural) => {
  return count + ' ' + (count === 1 ? singular : plural);
});

handlebars.registerHelper('concat', function () {
  var arg = Array.prototype.slice.call(arguments, 0);
  arg.pop();
  return arg.join('');
});

handlebars.registerHelper('stringify', function (variable) {
  var arg = JSON.stringify(variable);
  return arg;
});
handlebars.registerHelper('prettyStringify', function (variable) {
  var arg = JSON.stringify(variable, null, 2);
  return arg;
});

handlebars.registerHelper('returnDate', function (value) {
  return moment(value, 'YYYYMMDD').format('DD/MM/YYYY');
});

handlebars.registerHelper('parse', function (variable) {
  try {
    var arg = JSON.parse(variable);
  } catch (e) {
    return variable;
  }

  return arg;
});
handlebars.registerHelper('showhide', function () {
  var arg = Array.prototype.slice.call(arguments, 0);
  arg.pop();
  /**
  <details>
    <summary><span class="summary" tabindex="0">{{ licenceData.handsOffFlowHelp }}</span></summary>
    <div class="panel panel-border-narrow">
      <h3 class="heading-small">What is a flow condition?</h3>
      <p>A licence condition which applies to some water abstraction licences, to protect our water levels in times of low surface water supply.</p>
      <p>A flow condition will affect the licensed maximum amount you can abstract.</p>
    </div>
  </details>
  **/
  var htmlContent = '';
  htmlContent += '';
  htmlContent += '<details>';
  htmlContent += '<summary><span class="summary" tabindex="0">' + arg[0] + '</span></summary>';
  htmlContent += '<div class="panel panel-border-narrow">';
  htmlContent += '<h3 class="heading-small">' + arg[1] + '</h3>';
  htmlContent += arg[2];
  htmlContent += '</div>';
  htmlContent += '</details>';
  return htmlContent;
});

handlebars.registerHelper('guid', function () {
  return Helpers.createGUID();
});

const formatISODate = (dateInput, options) => {
  if (!dateInput) {
    return null;
  }
  const date = moment(dateInput);
  const { format = 'D MMMM YYYY' } = options;
  return date.isValid() ? date.format(format) : dateInput;
};

handlebars.registerHelper('formatISODate', function (dateInput, options) {
  return formatISODate(dateInput, options.hash);
});

handlebars.registerHelper('formatMeterKey', function (value, options) {
  const parts = value.split('_');
  const { index = 0 } = options.hash;
  return formatISODate(parts[index], options.hash);
});

const Path = require('path');

const defaultContext = {
  assetPath: '/public/',
  topOfPage: 'Login Handler',
  head: '<link href="public/stylesheets/overrides.css" media="screen" rel="stylesheet" /><meta name="robots" content="noindex, nofollow">',
  pageTitle: ' Generic Page',
  htmlLang: 'en',
  bodyClasses: 'some classes here',
  bodyStart: 'Body Start',
  skipLinkMessage: 'Skip to main content',
  cookieMessage: 'Cookie Message',
  headerClass: 'some classes here',
  homepageUrl: 'http://page/url',
  logoLinkTitle: 'Logo Link Title',
  globalHeaderText: 'GOV.UK',
  insideHeader: '',

  propositionHeader: '<div class="header-proposition"><div class="content"><nav id="proposition-menu"><a href="/" id="proposition-name">Water resource licensing admin service</a></nav></div></div>',
  afterHeader: '',
  footerTop: '',
  footerSupportLinks: '<ul><li><a href="/logout">Log Out</a></li></ul>',
  licenceMessage: '<p>All content is available under the <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Open Government Licence v3.0</a>, except where otherwise stated</p>',
  bodyEnd: ''
};

module.exports = {
  engines: {
    html: handlebars
  },
  relativeTo: __dirname,
  path: Path.join(__dirname, ''),
  layoutPath: Path.join(__dirname, 'govuk_template_mustache/layouts'),
  layout: 'govuk_template',
  partialsPath: Path.join(__dirname, 'partials/'),
  context: defaultContext
};
