const Boom = require('boom');
const util = require('util');
const stringify = require('csv-stringify');
const csvStringify = util.promisify(stringify);
const { uniq } = require('lodash');

const { getInvitationForm, formSchema, getWaterServiceRequest, getInvitationDataForm, getWaterServiceReminderRequest } = require('./helpers');
const { handleRequest, getValues } = require('../../lib/forms');

const View = require('../../lib/view');
const { previewReturnsInvitation, sendReturnsInvitation, sendReturnsForms } = require('../../lib/connectors/water');

const { remindersForm, remindersSchema } = require('./forms');

/**
 * Displays a form to start the flow for sending invitation to complete
 * return
 */
const getReturnInvitation = async(request, reply) => {
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
      const { personalisation: { address_line_1, address_line_2, address_line_3, address_line_4, address_line_5, address_line_6, postcode } } = row;

      const licences = uniq(row.licences);

      const data = {
        address_line_1,
        address_line_2,
        address_line_3,
        address_line_4,
        address_line_5,
        address_line_6,
        postcode
      };

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
const postReturnInvitation = async(request, reply) => {
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
  }
};

/**
 * Submit return invitation.  Accepts the JSON payload calculated in the
 * the previous step and POST's to water service
 */
const postReturnInvitationSend = async(request, reply) => {
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

/**
 * Renders a form to allow user to send return reminders
 */
const getReturnReminders = async(request, reply) => {
  const form = remindersForm();

  const view = {
    ...View.contextDefaults(request),
    form
  };
  return reply.view('water/admin/returns-notifications/reminder', view);
};

/**
 * Post handler for return reminders
 */
const postReturnReminders = async(request, reply) => {
  const form = handleRequest(remindersForm(), request, remindersSchema);

  const view = View.contextDefaults(request);

  if (form.isValid) {
    const payload = getWaterServiceReminderRequest({
      issuer: request.auth.credentials.name,
      ...getValues(form)
    });

    console.log(payload);

    const { error, data } = await sendReturnsForms('pdf.return_reminder', payload);

    if (error) {
      throw Boom.badImplementation(`Error previewing PDF reminders`, { payload, error });
    }

    const sendForm = getInvitationDataForm(payload, '/admin/returns-notifications/reminders/send');
    return reply.view('water/admin/returns-notifications/preview-reminder', {
      ...view,
      data,
      recipients: data.length,
      form: sendForm
    });
  }

  view.form = form;
  return reply.view('water/admin/returns-notifications/reminder', view);
};

/**
 * Accepts JSON payload from previous step and sends the message
 */
const postSendReturnReminders = async(request, reply) => {
  try {
    const payload = JSON.parse(request.payload.data);

    const response = await sendReturnsForms('pdf.return_reminder', payload, false);

    const { recipients } = JSON.parse(response.event.metadata);

    const view = {
      ...View.contextDefaults(request),
      ...response,
      recipients
    };

    console.log(response);
    return reply.view('water/admin/returns-notifications/success-reminder', view);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getReturnInvitation,
  postReturnInvitation,
  postReturnInvitationSend,
  getReturnReminders,
  postReturnReminders,
  postSendReturnReminders
};
