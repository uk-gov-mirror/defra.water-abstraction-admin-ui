const csvParse = require('csv-parse/lib/sync');
const Joi = require('@hapi/joi');
const View = require('./../lib/view');
const { entities, documents, documentEntities } = require('../lib/connectors/crm');
const Promise = require('bluebird');

/**
 * Allows user to import contacts for documents
 * Each contact is set up as a CRM individual entity, and linked to the
 * document via the document_entities table
 */
function getImportContacts (request, reply) {
  const viewContext = View.contextDefaults(request);
  return reply.view('water/admin/importContacts.html', viewContext);
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
 * Find an entity In CRM
 * @param {Object} filter
 * @return {Promise} resolves with entity data if found
 */
async function findEntity (filter) {
  const { data, error } = await entities.findMany(filter);
  if (error) {
    throw error;
  }
  if (data.length === 1) {
    return data[0];
  }
  return null;
}

/**
 * Create an entity In CRM
 * @param {Object} entity - entity data to save
 * @return {Promise} resolves with entity data if found
 */
async function createEntity (entity) {
  const { data, error } = await entities.create(entity);
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Find or create an individual by email address
 * @param {String} emailAddress
 * @return {Promise} resolves with entity data
 */
async function findOrCreateIndividual (emailAddress = '') {
  const entity = {
    entity_nm: emailAddress.toLowerCase(),
    entity_type: 'individual'
  };
  const existing = await findEntity(entity);
  if (existing) {
    return existing;
  }
  return createEntity({ ...entity, source: 'contact_import' });
}

/**
 * Detach existing contacts with a certain role from a document
 * @param {String} documentId
 * @param {String} role
 * @return {Promise} resolves when deleted
 */
async function deleteExistingContacts (documentId, role) {
  return documentEntities
    .setParams({ documentId })
    .delete({ role });
}

/**
 * Import a single data row
 * @param {Object} row
 * @param {String} row.email - contact email address
 * @param {String} row.role - how this contact relates to the licence
 * @param {String} row.licence_number - abstraction licence number
 * @return {Promise} resolves with import status info
 */
async function importRow (row) {
  const schema = {
    email: Joi.string().trim().lowercase().email(),
    role: Joi.string(),
    licence_number: Joi.string()
  };

  const { error, value } = Joi.validate({
    email: row.email,
    licence_number: row.licence_number,
    role: row.role
  }, schema);

  if (error) {
    return { row, error };
  }

  // @TODO
  // Find/create entity, find document ID by licence number, create doc entity role
  const { email, role, licenceNumber } = value;

  try {
    // Find document
    const { error, data: [document] } = await documents.findMany({ system_external_id: licenceNumber });

    if (error) {
      throw error;
    }

    if (!document) {
      return { row, error: new LicenceNotFoundError() };
    }

    // Create entity
    const entity = await findOrCreateIndividual(email);

    // Delete existing roles
    const { error: deleteRoleError } = await deleteExistingContacts(document.document_id, role);

    if (deleteRoleError && deleteRoleError.name !== 'NotFoundError') {
      return { row, error: deleteRoleError };
    }

    // Create role
    const { data: documentEntity, error: documentEntityError } = await documentEntities
      .setParams({ documentId: document.document_id })
      .create({
        entity_id: entity.entity_id,
        role
      });

    if (documentEntityError) {
      return { row, error: documentEntityError };
    }

    return { row, entity, document, documentEntity, error: null };
  } catch (error) {
    return { row, error };
  }
}

/**
 * Post handler for importing contacts
 * @param {String} request.payload.contacts - CSV contact data pasted in textarea field
 */
async function postImportContacts (request, reply) {
  const viewContext = View.contextDefaults(request);

  try {
    const data = csvParse(request.payload.contacts, { columns: true, skip_lines_with_empty_values: true });

    if (data.length < 1) {
      throw new InvalidDataError('No rows found');
    }
    if (!(data[0].email && data[0].role && data[0].licence_number)) {
      throw new InvalidDataError('Invalid columns specified');
    }

    viewContext.result = await Promise.map(data, importRow, { concurrency: 1 });

    return reply.view('water/admin/importContactsSuccess.html', viewContext);
  } catch (error) {
    viewContext.error = error;
    return reply.view('water/admin/importContacts.html', viewContext);
  }
}

exports.getImportContacts = getImportContacts;
exports.postImportContacts = postImportContacts;
