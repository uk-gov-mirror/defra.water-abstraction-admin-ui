const { getSearchForm } = require('./forms/search');
const View = require('../../lib/view');
const { entities } = require('../../lib/connectors/crm');
const waterReturns = require('../../lib/connectors/water-returns');
const { handleRequest, getValues } = require('../../lib/forms');
const { repairWeeklyReturn, compare } = require('./helpers');

/**
 * Displays a search form to find a return by return ID
 */
const getSearch = async (request, reply) => {
  const form = getSearchForm();

  const view = {
    ...View.contextDefaults(request),
    form
  };

  return reply.view('water/admin/returns-repair/index', view);
};

/**
 * Finds entity ID for given email address
 * @param {String} email
 * @return {String} GUID
 */
const findEntityId = async (email) => {
  const filter = {
    entity_type: 'individual',
    entity_nm: email.toLowerCase()
  };
  const { data: [entity] } = await entities.findMany(filter);
  return entity ? entity.entity_id : '00000000-0000-0000-0000-000000000000';
};

/**
 * Post handler for search form.
 * Does not process result
 */
const postSearch = async (request, reply) => {
  const form = handleRequest(getSearchForm(), request);
  if (form.isValid) {
    const { returnId } = getValues(form);

    const data = await waterReturns.getReturn(returnId);

    if (data.frequency === 'week') {
      const { name: email } = request.auth.credentials;
      const entityId = await findEntityId(email);
      const repaired = repairWeeklyReturn(data, email, entityId);
      const { versions, ...rest } = repaired;
      const jsonData = JSON.stringify(rest);
      const isEqual = compare(data, repaired);
      return reply.view('water/admin/returns-repair/repaired', {
        ...View.contextDefaults(request),
        data,
        repaired,
        jsonData,
        isEqual
      });
    }
  }

  // Re-render form
  const view = {
    ...View.contextDefaults(request),
    form
  };
  return reply.view('water/admin/returns-repair/index', view);
};

/**
 * Posts updated return to water service
 */
const postSubmit = async (request, reply) => {
  const data = JSON.parse(request.payload.data);
  await waterReturns.postReturn(data);
  const view = View.contextDefaults(request);
  return reply.view('water/admin/returns-repair/success', view);
};

module.exports = {
  getSearch,
  postSearch,
  postSubmit
};
