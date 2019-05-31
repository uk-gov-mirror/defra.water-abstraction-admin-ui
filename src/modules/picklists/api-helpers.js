const Boom = require('@hapi/boom');
const { picklists, picklistItems } = require('../../lib/connectors/water');

const apiCall = async (client, method, args) => {
  const { data, error } = await client[method](...args);

  if (error) {
    throw Boom.badImplementation(`API error ${client.config.endpoint} ${method}`, error);
  }

  return data;
};

const getAllPicklists = async () => {
  return apiCall(picklists, 'findMany', [{}, { name: 1 }]);
};

const getPicklist = async (picklistId) => {
  return apiCall(picklists, 'findOne', [picklistId]);
};

const getPicklistItems = async (picklistId) => {
  return apiCall(picklistItems, 'findMany', [{ picklist_id: picklistId }, { value: +1 }]);
};

const getPicklistItem = async (itemId) => {
  return apiCall(picklistItems, 'findOne', [itemId]);
};

const createPicklistItem = async (item) => {
  return apiCall(picklistItems, 'create', [item]);
};

const updatePicklistItem = async (itemId, item) => {
  return apiCall(picklistItems, 'updateOne', [itemId, item]);
};

module.exports = {
  getAllPicklists,
  getPicklist,
  getPicklistItems,
  getPicklistItem,
  createPicklistItem,
  updatePicklistItem
};
