const { badImplementation } = require('boom');
const { getReturnsFormats, getReturnsLogs, getReturnsLines } = require('../../lib/connectors/water');
const View = require('../../lib/view');

/**
 * Renders a form to search for a licence's returns formats
 * @param {String} request.query.q - the licence number
 */
const getReturnsSearch = async (request, reply) => {
  const view = View.contextDefaults(request);
  const { q } = request.query;

  if (q) {
    try {
      view.formats = await getReturnsFormats(q);
      view.q = q;
    } catch (err) {
      return badImplementation('Error getting returns formats from water service', err);
    }
  }

  return reply.view('water/admin/returns/search', view);
};

const getLogsList = async (request, reply) => {
  const view = View.contextDefaults(request);
  const { regionCode, formatId } = request.params;
  try {
    view.logs = await getReturnsLogs(regionCode, formatId);
    return reply.view('water/admin/returns/logs', view);
  } catch (err) {
    return badImplementation('Error getting returns formats from water service', err);
  }
};

const getLinesList = async (request, reply) => {
  const { regionCode, formatId, day, month, year } = request.params;
  try {
    const date = `${day}/${month}/${year}`;
    const view = {
      ...View.contextDefaults,
      lines: await getReturnsLines(regionCode, formatId, date),
      ...request.params
    };
    return reply.view('water/admin/returns/lines', view);
  } catch (err) {
    return badImplementation('Error getting returns formats from water service', err);
  }
};

module.exports = {
  getReturnsSearch,
  getLogsList,
  getLinesList
};
