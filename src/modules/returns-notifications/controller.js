// const Joi = require('joi');

const { getInvitationForm, formSchema, getWaterServiceRequest, getInvitationDataForm } = require('./helpers');
const { handleRequest, getValues } = require('../../lib/forms');

const View = require('../../lib/view');
const { previewReturnsInvitation, sendReturnsInvitation } = require('../../lib/connectors/water');

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
 * Post handler for form.  If there are errors, the form is displayed again
 * otherwise, a request is sent to the preview endpoint, which returns
 * the number of recipients and licence numbers affected
 */
const postReturnInvitation = async(request, reply) => {
  const form = handleRequest(getInvitationForm(), request, formSchema);

  try {
    if (form.isValid) {
      // Format data ready for POST to water service
      const payload = getWaterServiceRequest({
        issuer: request.auth.credentials.name,
        ...getValues(form)
      });

      const response = await previewReturnsInvitation(payload);
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

module.exports = {
  getReturnInvitation,
  postReturnInvitation,
  postReturnInvitationSend
};
