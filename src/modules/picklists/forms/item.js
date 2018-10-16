const { cloneDeep } = require('lodash');
const Joi = require('joi');
const { formFactory, fields, setValues } = require('../../../lib/forms');
const { mapError } = require('./map-error');

/**
 * Creates form view model for sending invites
 * @return {Object}
 */
const itemForm = (picklist, item) => {
  const { picklist_id: picklistId } = picklist;

  const action = item
    ? `/admin/picklist/${picklistId}/edit-item/${item.picklist_item_id}`
    : `/admin/picklist/${picklistId}/create-item`;

  const f = formFactory(action);

  // Existing item - can only change hidden status
  if (!item) {
    if (picklist.id_required) {
      f.fields.push(fields.text('id', { label: 'Item ID' }));
    }
    f.fields.push(fields.text('value', { label: 'Item Value' }));
    f.fields.push(fields.hidden('picklist_id', {}, picklistId));
  }

  f.fields.push(fields.checkbox('hidden', { label: 'Hide this item', mapper: 'booleanMapper' }));
  f.fields.push(fields.button('', { label: 'Submit' }));

  return item ? setValues(f, item) : f;
};

/**
 * Gets Joi schema for picklist item form
 * @param {Object} picklist
 * @return {Object} Joi schema
 */
const itemFormSchema = (picklist, item) => {
  if (item) {
    return {
      hidden: Joi.boolean().required()
    };
  } else {
    const schema = {
      picklist_id: Joi.string().required(),
      value: Joi.string().required(),
      hidden: Joi.boolean().required()
    };
    if (picklist.id_required) {
      schema.id = Joi.string().required();
    }
    return schema;
  }
};

/**
 * Applies a duplicate value error state to the form
 * @param {Object} form
 * @return {Object} new form
 */
const applyItemError = (form, error) => {
  const f = cloneDeep(form);
  const formError = mapError(error, 'Picklist items must have unique values and IDs');
  f.isValid = false;
  f.errors.push(formError);
  return f;
};

module.exports = {
  itemForm,
  itemFormSchema,
  applyItemError
};
