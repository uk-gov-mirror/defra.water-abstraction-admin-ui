const csvParse = require('csv-parse/lib/sync');
const Joi = require('joi');
const View = require('./../lib/view');
const { licences } = require('../lib/connectors/permit');
const Promise = require('bluebird');
const { find } = require('lodash');

/**
 * Allows user to import gauging stations for licences
 */
function getImportStations(request, reply) {
  const viewContext = View.contextDefaults(request)
  reply.view('water/admin/importGaugingStations.html', viewContext);
}


class InvalidDataError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidDataError';
  }
}

class LicenceNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LicenceNotFoundError';
  }
}




/**
 * Takes row data from CSV dump and organises by licence number
 * @param {Array} data - data from CSV
 * @return {Object} data - keyed by licence number
 */
function prepareData(data) {

  const prepared = [];

  for (const row of data) {
    const { wiski_id: wiskiId, licence_number: licence_ref } = row;
    const station = { wiskiId };
    let licence;
    if (!(licence = find(prepared, { licence_ref }))) {
      licence = {
        licence_ref,
        metadata: {
          gaugingStations: []
        }
      }
      prepared.push(licence);
    }
    licence.metadata.gaugingStations.push(station);
  }
  return prepared;

}


/**
 * Checks uploaded CSV data is valid, otherwise throws error
 * @param {Array} data
 * @return {Array} data
 */
function validateData(data) {
  console.log('validating', data);
  if (data.length < 1) {
    throw new InvalidDataError('No rows found');
  }
  if (!(data[0].wiski_id && data[0].licence_number)) {
    throw new InvalidDataError('Invalid columns specified');
  }
  return data;
}


/**
 * Write single licence metadata
 * @param {Object} row - prepared row data
 * @return {Promise} resolves with {error, data}
 */
async function writeRow(row) {
  const { licence_ref } = row;
  const { error, data: [licence] } = await licences.findMany({ licence_ref });

  if (error) {
    return { data: row, error };
  }
  if (!licence) {
    return { data: row, error: new LicenceNotFoundError(`Licence ${ licence_ref } not found`) };
  }

  // Parse existing metadata
  const metadata = {
    ...licence.metadata,
    ...row.metadata
  }

  return licences.updateMany({ licence_ref }, { metadata: JSON.stringify(metadata) });
}


/**
 * Write data - sets metadata on permit repo
 * @param {Object} data
 */
async function writeData(data) {
  return Promise.map(data, writeRow);
}

/**
 * Post handler for importing contacts
 * @param {String} request.payload.contacts - CSV contact data pasted in textarea field
 */
async function postImportStations(request, reply) {
  const viewContext = View.contextDefaults(request)

  try {
    const data = csvParse(request.payload.stations, { columns: true, skip_lines_with_empty_values: true });

    validateData(data);
    const prepared = prepareData(data);

    viewContext.result = await writeData(prepared);

    reply.view('water/admin/importGaugingStationsSuccess.html', viewContext);

  } catch (error) {
    console.error(error);
    viewContext.error = error;
    reply.view('water/admin/importGaugingStations.html', viewContext);
  }

}


module.exports = {
  getImportStations,
  postImportStations
};