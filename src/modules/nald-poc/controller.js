const { getReturnsLogs, getReturnsLines } = require('../../lib/connectors/water');
const { validateRequest, mapLog, mapLine } = require('./helpers');

/**
 * Controller method to get an example form log record
 * @param {Object} request - HAPI request interface
 * @param {String} request.query.filter - JSON encoded filter object
 * @param {Object} reply - HAPI reply interface
 */
const getLogs = async (request, reply) => {
  try {
    validateRequest(request);
    const data = await getReturnsLogs(6, 10032889);
    const filtered = data.filter(row => {
      return row.DATE_FROM === '01/11/2016';
    });
    return reply(filtered.map(mapLog));
  } catch (err) {
    console.error(err);
    reply({ error: err.toString() }).code(500);
  }
};

/**
 * Controller method to get an example form lines records
 * @param {Object} request - HAPI request interface
 * @param {String} request.query.filter - JSON encoded filter object
 * @param {Object} reply - HAPI reply interface
 */
const getLines = async (request, reply) => {
  try {
    validateRequest(request);
    const data = await getReturnsLines(6, 10032889, '01/11/2016');
    return reply(data.map(mapLine));
  } catch (err) {
    console.error(err);
    reply({ error: err.toString() }).code(500);
  }
};

module.exports = {
  getLogs,
  getLines
};
