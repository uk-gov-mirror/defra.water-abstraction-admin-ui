const Joi = require('joi');

const { getReturnDates } = require('../helpers');
const { formFactory, fields, setValues } = require('../../../lib/forms');

const form = () => {
  const f = formFactory('/admin/returns-notifications/reminders');

  f.fields.push(fields.date('from', { label: 'Return end dates from' }));
  f.fields.push(fields.date('to', { label: 'Return end dates to' }));
  f.fields.push(fields.text('excludeLicences', { label: 'Exclude licences', multiline: true, hint: 'Separate licence numbers with a comma or new line' }));
  f.fields.push(fields.button('', { label: 'Continue' }));

  // Initially set values to current return cycle
  return setValues(f, getReturnDates());
};

const schema = {
  from: Joi.string().isoDate().options({ convert: false }),
  to: Joi.string().isoDate().options({ convert: false }),
  excludeLicences: Joi.string().allow('')
};

module.exports = {
  remindersForm: form,
  remindersSchema: schema
};
