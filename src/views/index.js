const handlebars = require('handlebars');
const moment = require('moment');
const path = require('path');

const helpers = require('../lib/helpers');
const { splitString } = require('../lib/string-formatter');

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
  const arg = Array.prototype.slice.call(arguments, 0);
  arg.pop();
  return arg.join('');
});

handlebars.registerHelper('stringify', function (variable) {
  return JSON.stringify(variable);
});
handlebars.registerHelper('prettyStringify', function (variable) {
  return JSON.stringify(variable, null, 2);
});

handlebars.registerHelper('returnDate', function (value) {
  return moment(value, 'YYYYMMDD').format('DD/MM/YYYY');
});

handlebars.registerHelper('parse', function (variable) {
  try {
    const arg = JSON.parse(variable);
    return arg;
  } catch (e) {
    return variable;
  }
});

handlebars.registerHelper('guid', function () {
  return helpers.createGUID();
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

/**
 * Splits a string to array, and gets the numbered segment
 */
handlebars.registerHelper('splitString', (value, options) => {
  const { index = 0, separator = ',' } = options.hash;
  return splitString(value, index, separator);
});

const assetPath = '/admin/public/';

const defaultContext = {
  assetPath,
  topOfPage: 'Login Handler',
  head: `<link href="${assetPath}stylesheets/overrides.css" media="screen" rel="stylesheet" /><meta name="robots" content="noindex, nofollow">`,
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
  path: path.join(__dirname, ''),
  layoutPath: path.join(__dirname, 'govuk_template_mustache/layouts'),
  layout: 'govuk_template',
  partialsPath: path.join(__dirname, 'partials/'),
  context: defaultContext
};
