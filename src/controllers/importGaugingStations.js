const csvParse = require('csv-parse/lib/sync');
const View = require('./../lib/view');
const { licences } = require('../lib/connectors/permit');
const Promise = require('bluebird');
const { find } = require('lodash');

const { licence: { typeId, regimeId } } = require('../../config.js');

/**
 * Allows user to import gauging stations for licences
 */
function getImportStations (request, reply) {
  const viewContext = View.contextDefaults(request);
  return reply.view('water/admin/importGaugingStations.html', viewContext);
}

class InvalidDataError extends Error {
  constructor (message) {
    super(message);
    this.name = 'InvalidDataError';
  }
}

class LicenceNotFoundError extends Error {
  constructor (message) {
    super(message);
    this.name = 'LicenceNotFoundError';
  }
}

/**
 * Takes row data from CSV dump and organises by licence number
 * @param {Array} data - data from CSV
 * @return {Object} data - keyed by licence number
 */
function prepareData (data) {
  const prepared = [];

  for (const row of data) {
    const { station_reference: stationReference, licence_number: licenceRef } = row;
    const station = { stationReference };
    let licence;
    if (!(licence = find(prepared, { licence_ref: licenceRef }))) {
      licence = {
        licence_ref: licenceRef,
        metadata: {
          gaugingStations: []
        }
      };
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
function validateData (data) {
  if (data.length < 1) {
    throw new InvalidDataError('No rows found');
  }
  if (!(data[0].station_reference && data[0].licence_number)) {
    throw new InvalidDataError('Invalid columns specified');
  }
  return data;
}

/**
 * Write single licence metadata
 * @param {Object} row - prepared row data
 * @return {Promise} resolves with {error, data}
 */
async function writeRow (row) {
  const { licence_ref: licenceRef } = row;
  const { error, data: [licence] } = await licences.findMany({ licence_ref: licenceRef });

  if (error) {
    return { data: row, error };
  }
  if (!licence) {
    return { data: row, error: new LicenceNotFoundError(`Licence ${licenceRef} not found`) };
  }

  // Parse existing metadata
  const metadata = {
    ...licence.metadata,
    ...row.metadata
  };

  const filter = {
    licence_ref: licenceRef,
    licence_regime_id: regimeId,
    licence_type_id: typeId
  };

  return licences.updateMany(filter, { metadata: JSON.stringify(metadata) });
}

/**
 * Write data - sets metadata on permit repo
 * @param {Object} data
 */
async function writeData (data) {
  return Promise.map(data, writeRow);
}

/**
 * Post handler for importing contacts
 * @param {String} request.payload.contacts - CSV contact data pasted in textarea field
 */
async function postImportStations (request, reply) {
  const viewContext = View.contextDefaults(request);

  try {
    const data = csvParse(request.payload.stations, { columns: true, skip_lines_with_empty_values: true });

    validateData(data);
    const prepared = prepareData(data);

    viewContext.result = await writeData(prepared);

    return reply.view('water/admin/importGaugingStationsSuccess.html', viewContext);
  } catch (error) {
    console.error(error);
    viewContext.error = error;
    return reply.view('water/admin/importGaugingStations.html', viewContext);
  }
}

exports.getImportStations = getImportStations;
exports.postImportStations = postImportStations;
