const { handleRequest, getValues } = require('../../lib/forms');
const { itemForm, itemFormSchema, applyItemError } = require('./forms/item');

const View = require('../../lib/view');
const api = require('./api-helpers');

/**
 * View list of picklists with option to create
 */
const getPicklists = async(request, reply) => {
  const picklists = await api.getAllPicklists();

  const view = {
    ...View.contextDefaults(request),
    picklists
  };

  return reply.view('water/admin/picklists/index', view);
};

/**
 * View existing picklist
 */
const getPicklist = async(request, reply) => {
  const { id } = request.params;

  const picklist = await api.getPicklist(id);
  const items = await api.getPicklistItems(id);

  const view = {
    ...View.contextDefaults(request),
    picklist,
    items
  };

  return reply.view('water/admin/picklists/picklist', view);
};

/**
 * Create picklist item
  * @param {String} request.params.id - picklist ID
  */
const getCreateItem = async(request, reply) => {
  const { id } = request.params;

  const picklist = await api.getPicklist(id);

  const form = itemForm(picklist);

  const view = {
    ...View.contextDefaults(request),
    picklist,
    form
  };

  return reply.view('water/admin/picklists/edit-item', view);
};

/**
 * Post handler for creating picklist item
 * @param {String} request.params.id - picklist ID
 * @param {String} [request.payload.id] - user-defined item ID
 * @param {String} request.payload.value - user-defined item text
 */
const postCreateItem = async(request, reply) => {
  const { id } = request.params;

  // Load API data
  const picklist = await api.getPicklist(id);

  // Create form
  const schema = itemFormSchema(picklist);
  const form = handleRequest(itemForm(picklist), request, schema);

  const view = {
    ...View.contextDefaults(request),
    picklist,
    form
  };

  if (form.isValid) {
    const item = getValues(form);

    try {
      await api.createPicklistItem(item);

      return reply.redirect(`/admin/picklist/${id}`);
    } catch (err) {
      console.error(err);
      view.form = applyItemError(form, err);
    }
  }

  return reply.view('water/admin/picklists/edit-item', view);
};

/**
 * Edit existing picklist item form
 * @param {String} request.params.id - picklist ID
 * @param {String} request.params.itemId - picklist item ID
 */
const getEditItem = async(request, reply) => {
  const { id, itemId } = request.params;

  const picklist = await api.getPicklist(id);
  const item = await api.getPicklistItem(itemId);

  const form = itemForm(picklist, item);

  const view = {
    ...View.contextDefaults(request),
    picklist,
    form
  };

  return reply.view('water/admin/picklists/edit-item', view);
};

/**
 * Post handler for editing picklist item
 * @param {String} request.params.id - picklist ID
 * @param {String} request.params.itemId - picklist item ID
 * @param {String} [request.payload.id] - user-defined item ID
 * @param {String} request.payload.value - user-defined item text
 * @param {String} request.payload.delete - if 'true', item is deleted
 */
const postEditItem = async(request, reply) => {
  const { id, itemId } = request.params;

  // Load API data
  const picklist = await api.getPicklist(id);
  const item = await api.getPicklistItem(itemId);

  // Create form
  const schema = itemFormSchema(picklist, item);
  const form = handleRequest(itemForm(picklist, item), request, schema);

  // Initialise view data
  const view = {
    ...View.contextDefaults(request),
    picklist,
    item,
    form
  };

  if (form.isValid) {
    const data = getValues(form);

    try {
      await api.updatePicklistItem(itemId, data);
      return reply.redirect(`/admin/picklist/${id}`);
    } catch (err) {
      console.error(err);
      view.form = applyItemError(form, err);
    }
  }

  return reply.view('water/admin/picklists/edit-item', view);
};

module.exports = {
  getPicklists,
  getPicklist,
  getCreateItem,
  postCreateItem,
  getEditItem,
  postEditItem

};
