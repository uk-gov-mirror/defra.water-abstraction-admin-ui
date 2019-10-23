'use strict';

const View = require('../lib/view');
const Idm = require('../lib/connectors/idm');
const Crm = require('../lib/connectors/crm');

async function users (request, reply) {
  return Idm.getUsers()
    .then((users) => {
      const viewContext = View.contextDefaults(request);
      viewContext.pageTitle = 'GOV.UK - Admin/Fields';
      viewContext.users = users;
      return reply.view('water/admin/viewusers', viewContext);
    });
}

async function createUser (request, reply) {
  return Idm.createUser(request.payload)
    .then(() => {
      const data = {};
      data.entity_nm = request.payload.user_name;
      data.entity_type = 'individual';
      data.entity_definition = '{}';
      return Crm.createEntity(data);
    })
    .then(() => {
      return users(request, reply);
    });
}

async function updateUser (request, reply) {
  await Idm.updateUser(request.params.user_id, request.payload);
  return reply.redirect(`/admin/idm/users/${request.params.user_id}`);
}

async function user (request, reply) {
  return Idm.getUser({
    user_id: request.params.user_id
  }).then((user) => {
    const viewContext = View.contextDefaults(request);
    const viewUser = user;
    viewUser.user_data = JSON.stringify(user.user_data, null, 2);
    viewUser.role = JSON.stringify(user.role, null, 2);
    viewContext.pageTitle = 'GOV.UK - Admin/Fields';
    viewContext.user = viewUser;
    viewContext.user_id = request.params.user_id;
    return reply.view('water/admin/viewuser', viewContext);
  });
}

const filterEntitiesWithExternalId = (entities = [], externalId) => {
  return entities.filter(entity => entity.entity_id !== externalId);
};

/**
 * Handler which prepares the view model with data about the
 * user who is potentially going to be deleted.
 */
const getDeleteUser = async (request, reply) => {
  const viewContext = View.contextDefaults(request);

  return Idm.getUser({ user_id: request.params.user_id })
    .then(user => {
      viewContext.user = user;
      viewContext.userHasExternalId = !!user.external_id;

      if (user.external_id) {
        const crmPromises = [
          Crm.getEntityRoles(user.external_id),
          Crm.getEntityContactDocuments(user.external_id),
          Crm.verifications.findMany({
            entity_id: user.external_id,
            date_verified: null
          }),
          Crm.getEntitiesByEmail(user.user_name)
        ];
        return Promise.all(crmPromises);
      }
      return [];
    })
    .then(crmResponses => {
      if (crmResponses.length) {
        const [
          entityRoles, contactDocuments,
          outstandingVerifications, entitiesByEmail
        ] = crmResponses;

        viewContext.entityRoles = entityRoles;
        viewContext.contactDocuments = contactDocuments.data;
        viewContext.outstandingVerificationsCount = outstandingVerifications.data.length;
        viewContext.otherEntities = filterEntitiesWithExternalId(
          entitiesByEmail,
          viewContext.user.external_id
        );
      }
      return reply.view('water/admin/deleteUser', viewContext);
    });
};

const deleteUserByEntityID = entityID => {
  return Crm.deleteVerificationsByEntityID(entityID)
    .then(() => Crm.deleteEntityRoles(entityID))
    .then(() => Crm.deleteEntityContactDocuments(entityID))
    .then(() => Crm.entities.delete(entityID))
    .then(() => Idm.users.delete({ external_id: entityID }));
};

const deleteUserByUserID = userID => Idm.users.delete(userID);

/**
 * If the idm user record has an external id, the external id
 * is the crm entity id. This is then used to delete all of the
 * following data:
 *
 * - crm.verification documents
 * - crm.verifications
 * - crm.entity_roles
 * - crm.document_entity
 * - crm.entity
 * - idm.users
 *
 * If the user record is missing the external_id then only
 * the idm.user records is deleted using the user_id.
 *
 */
const postDeleteUser = async (request, reply) => {
  const entityID = request.payload.entity_id;
  const userID = request.payload.user_id;
  const url = '/admin/idm/users/deleted';
  const deletePromise = entityID
    ? deleteUserByEntityID(entityID)
    : deleteUserByUserID(userID);

  return deletePromise
    .then(() => reply.redirect(url))
    .catch(error => {
      console.error(error);
      return reply.redirect(url + '?error=true');
    });
};

const getUserDeleted = async (request, reply) => {
  const viewContext = View.contextDefaults(request);
  viewContext.deleteFailure = request.query.error;
  return reply.view('water/admin/deleteUserResult', viewContext);
};

exports.user = user;
exports.users = users;
exports.updateUser = updateUser;
exports.createUser = createUser;
exports.getDeleteUser = getDeleteUser;
exports.postDeleteUser = postDeleteUser;
exports.getUserDeleted = getUserDeleted;
