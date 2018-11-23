const moment = require('moment');
const Joi = require('joi');
const { formFactory, fields, setValues } = require('../../lib/forms');

/**
 * Gets dates relating to current return cycle in format YYYY-MM-DD
 * @return {Object}
 */
const getReturnDates = (refDate) => {
  const month = moment(refDate).month();

  // Predict summer/financial cycle start month (note: zero indexed)
  const refMonth = month >= 8 ? 10 : 3;

  const periodStart = moment(refDate).date(1).month(refMonth).subtract(1, 'years');
  const periodEnd = moment(periodStart).add(1, 'years').subtract(1, 'days');
  const due = moment(periodEnd).add(28, 'day');

  return {
    from: periodEnd.format('YYYY-MM-DD'),
    to: periodEnd.format('YYYY-MM-DD'),
    due: due.format('YYYY-MM-DD')
  };
};

/**
 * Creates config part of water service API request
 * @param {String} issuer - email address of user initiating notification
 * @return {Object}
 */
const getConfig = (issuer) => {
  return {
    rolePriority: ['licence_holder'],
    prefix: 'RINV-',
    issuer,
    messageRef: {
      default: 'returns_invitation_letter'
    },
    name: 'Returns: invitation'
  };
};

/**
 * Creates filter part of water service API request
 * @param {String} from - from date for date filter, YYYY-MM-DD
 * @param {String} to - to date for date filter, YYYY-MM-DD
 * @return {Object}
 */
const getFilter = (from, to) => {
  return {
    status: 'due',
    end_date: {
      $gte: moment(from).format('YYYY-MM-DD'),
      $lte: moment(to).format('YYYY-MM-DD')
    },
    'metadata->>isCurrent': 'true'
  };
};

/**
 * Creates personalisation part of water service API request
 * @param {String} due - date return is due  YYYY-MM-DD
 * @return {Object}
 */
const getPersonalisation = (due) => {
  return {
    date: moment(due).format('DD MMMM YYYY')
  };
};

/**
 * Accepts request and generates data to send to the Water Service API
 * @param {Object} request
 * @return {Object} payload data
 */
const getWaterServiceRequest = (data) => {
  const { from, to, due, issuer } = data;

  const filter = getFilter(from, to);
  const config = getConfig(issuer);
  const personalisation = getPersonalisation(due);

  return { config, filter, personalisation };
};

/**
 * A function to extract an array of licence numbers from a user-supplied string
 * @param {String} str - a string containing licence numbers
 * @return {Array} - array of unqiue matched licence numbers
 */
function extractLicenceNumbers (str) {
  // Return unique values
  // @see {@link https://stackoverflow.com/questions/1960473/get-all-unique-values-in-an-array-remove-duplicates}
  return str
    .split(/[ \n\r,\t;]+/ig)
    .filter(s => s)
    .filter((v, i, a) => a.indexOf(v) === i);
}

/**
 * Creates a filter to find returns for which we wish to send a paper
 * reminder letter and form
 * @param {String} from - from date for return cycle end date filter YYYY-MM-DD
 * @param {String} to - to date filter return cycle end date filter YYYY-MM-DD
 * @param {Array} excludeLicences - a list of licence numbers to exclude returns for
 * @return {Object} filter object
 */
const getReminderFilter = (from, to, excludeLicences = []) => {
  const filter = {
    end_date: {
      $gte: from,
      $lte: to
    },
    status: 'due',
    regime: 'water',
    licence_type: 'abstraction'
  };

  if (excludeLicences.length) {
    filter.licence_ref = {
      $nin: excludeLicences
    };
  }

  return filter;
};

/**
 * Gets data to send to water service endpoint for sending return reminders
 * @param {Object} data
 * @param {String} data.to - to filter for return end date
 * @param {String} data.from - from filter for return end date
 * @param {String} data.issuer - email address of current user sending message
 * @param {Array} data.excludeLicences - an array of licences to excude from the notification
 * @return {Object} - payload to send to water service
 */
const getWaterServiceReminderRequest = (data) => {
  const { from, to, issuer, excludeLicences } = data;
  const licenceNumbers = extractLicenceNumbers(excludeLicences);
  const filter = getReminderFilter(from, to, licenceNumbers);
  return {
    filter,
    issuer,
    name: 'send reminder letters',
    config: {
      rolePriority: ['returns_to', 'licence_holder']
    }
  };
};

/**
 * Creates form view model for sending invites
 * @return {Object}
 */
const getInvitationForm = () => {
  const f = formFactory('/admin/returns-notifications/invitation');

  f.fields.push(fields.date('due', { label: 'Return due by' }));
  f.fields.push(fields.date('from', { label: 'Return end dates from' }));
  f.fields.push(fields.date('to', { label: 'Return end dates to' }));
  f.fields.push(fields.checkbox('csv', { label: 'CSV export' }));
  f.fields.push(fields.button('', { label: 'Continue' }));

  // Initially set values to current return cycle
  return setValues(f, getReturnDates());
};

const formSchema = {
  due: Joi.date().required(),
  from: Joi.date().required(),
  to: Joi.date().required(),
  csv: Joi.boolean().truthy('true').default(false)
};

const getInvitationDataForm = (data, action = '/admin/returns-notifications/invitation/send') => {
  const f = formFactory(action);
  f.fields.push(fields.hidden('data'));
  f.fields.push(fields.button('', { label: 'Send letters' }));
  return setValues(f, { data: JSON.stringify(data) });
};

module.exports = {
  getInvitationForm,
  formSchema,
  getReturnDates,
  getWaterServiceRequest,
  getInvitationDataForm,
  getWaterServiceReminderRequest
};
