const { get } = require('lodash');

/**
 * Maps API error to a form error object
 * @param {Object} API error
 * @return {Object} form error
 */
const mapError = (err, message) => {
  const code = get(err, 'error.error.code', null);

  if (code === '23505') {
    return {
      name: 'value',
      summary: message,
      message
    };
  }

  return {
    name: 'value',
    summary: `Error (code ${code})`,
    message: `Error (code ${code})`
  };
};

module.exports = {
  mapError
};
