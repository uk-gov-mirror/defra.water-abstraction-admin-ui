const { formFactory, fields } = require('../../../lib/forms');

/**
 * Creates form view model for sending invites
 * @return {Object}
 */
const getSearchForm = () => {
  const f = formFactory('/admin/repair-returns');

  f.fields.push(fields.text('returnId', { label: 'Return ID' }));
  f.fields.push(fields.button(null, { label: 'Continue' }));

  return f;
};

module.exports = {
  getSearchForm
};
