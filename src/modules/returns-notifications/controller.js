const util = require('util');
const stringify = require('csv-stringify');
const csvStringify = util.promisify(stringify);
const { uniq, pick } = require('lodash');

const { getInvitationForm, formSchema, getWaterServiceRequest, getInvitationDataForm } = require('./helpers');
const { handleRequest, getValues } = require('../../lib/forms');

const View = require('../../lib/view');
const { previewReturnsInvitation, sendReturnsInvitation } = require('../../lib/connectors/water');

/**
 * Displays a form to start the flow for sending invitation to complete
 * return
 */
const getReturnInvitation = async (request, reply) => {
  const form = getInvitationForm();

  const view = {
    ...View.contextDefaults(request),
    form
  };
  return reply.view('water/admin/returns-notifications/invitation', view);
};

/**
 * Builds CSV response from data returned by return notification preview call
 * @param {Object} data
 * @return {Promise}
 */
const buildCsv = async (data) => {
  try {
    const maxLicenceCount = data.messages.reduce((acc, row) => {
      const licences = uniq(row.licences);
      return licences.length > acc ? licences.length : acc;
    }, 0);

    const contacts = data.messages.map(row => {
      const licences = uniq(row.licences);
      const data = pick(row.personalisation, [
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'postcode'
      ]);

      for (let i = 0; i < maxLicenceCount; i++) {
        data[`licence_${i + 1}`] = licences[i];
      }

      return data;
    });
    return await csvStringify(contacts, { header: true });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/**
 * Post handler for form.  If there are errors, the form is displayed again
 * otherwise, a request is sent to the preview endpoint, which returns
 * the number of recipients and licence numbers affected
 */
const postReturnInvitation = async (request, reply) => {
  const form = handleRequest(getInvitationForm(), request, formSchema);

  try {
    if (form.isValid) {
      const { csv: isCsvExport } = getValues(form);

      // Format data ready for POST to water service
      const payload = getWaterServiceRequest({
        issuer: request.auth.credentials.name,
        ...getValues(form)
      });

      const response = await previewReturnsInvitation(payload, isCsvExport);

      if (isCsvExport) {
        const csv = await buildCsv(response);
        const hapiResponse = reply(csv);
        hapiResponse.type('text/csv');
        hapiResponse.header('Content-Disposition', 'attachment; filename="contacts.csv"');
        return hapiResponse;
      }

      const f = getInvitationDataForm(payload);

      const view = {
        ...View.contextDefaults(request),
        ...response,
        form: f
      };

      return reply.view('water/admin/returns-notifications/preview', view);
    } else {
      const view = {
        ...View.contextDefaults(request),
        form
      };
      return reply.view('water/admin/returns-notifications/invitation', view);
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/**
 * Submit return invitation.  Accepts the JSON payload calculated in the
 * the previous step and POST's to water service
 */
const postReturnInvitationSend = async (request, reply) => {
  try {
    const payload = JSON.parse(request.payload.data);

    const response = await sendReturnsInvitation(payload);

    const view = {
      ...View.contextDefaults(request),
      ...response
    };

    return reply.view('water/admin/returns-notifications/success', view);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getReturnInvitation,
  postReturnInvitation,
  postReturnInvitationSend
};
