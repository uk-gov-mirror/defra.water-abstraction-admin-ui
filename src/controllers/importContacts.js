const csvParse = require('csv-parse/lib/sync');
const Joi = require('joi');
const View = require('./../lib/view');

/**
 * Allows user to import contacts for documents
 * Each contact is set up as a CRM individual entity, and linked to the
 * document via the document_entities table
 */
function getImportContacts(request, reply) {
  const viewContext = View.contextDefaults(request)
  reply.view('water/admin/importContacts.html', viewContext);
}


class InvalidDataError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidDataError';
  }
}


/**
 * Import a single data row
 * @param {Object} row
 * @param {String} row.email - contact email address
 * @param {String} row.role - how this contact relates to the licence
 * @param {String} row.licence_number - abstraction licence number
 * @return {Promise} resolves with import status info
 */
async function importRow(row) {
  const schema = {
    email: Joi.string().trim().lowercase().email(),
    role: Joi.string(),
    licence_number: Joi.string()
  };

  const { error, value } = Joi.validate(row, schema);

  if (error) {
    return { row, error };
  }



}

/**
 * Post handler for importing contacts
 * @param {String} request.payload.contacts - CSV contact data pasted in textarea field
 */
async function postImportContacts(request, reply) {
  const viewContext = View.contextDefaults(request)

  try {
    const data = csvParse(request.payload.contacts, { columns: true, skip_lines_with_empty_values: true });

    if (data.length < 1) {
      throw new InvalidDataError('No rows found');
    }
    if (!(data[0].email && data[0].role && data[0].licence_number)) {
      throw new InvalidDataError('Invalid columns specified');
    }
  } catch (error) {
    viewContext.error = error;
    reply.view('water/admin/importContacts.html', viewContext);
  }

}


module.exports = {
  getImportContacts,
  postImportContacts
};