const IDM = require('../lib/connectors/idm');
const CRM = require('../lib/connectors/crm');
const View = require('../lib/view');
const uuid = require('uuid/v4');

const createCrmAdminRole = async (entityId, regimeId) => {
  const role = {
    entity_id: entityId,
    role: 'admin',
    regime_entity_id: regimeId
  };
  await CRM.addRole(role);
};

const createCrmEntity = async userName => {
  const entity = {
    entity_nm: userName,
    entity_type: 'individual',
    entity_definition: '{}'
  };

  const newEntity = await CRM.entities.create(entity);
  return newEntity;
};

const getOrCreateCrmEntity = async (userName, regimeId) => {
  const crmUser = await CRM.entities.findMany({ entity_nm: userName }, {}, {});

  if (crmUser.data.length === 0) {
    const { data: newEntity } = await createCrmEntity(userName);
    await createCrmAdminRole(newEntity.entity_id, regimeId);
    return { created: 1, existing: 0, entity: newEntity };
  }
  return { created: 0, existing: 1, entity: crmUser.data[0] };
};

const getRegimeId = async () => {
  const crmRegime = await CRM.entities.findMany({ entity_nm: 'water-abstraction' }, {}, {});
  return crmRegime.data[0].entity_id;
};

const getOrCreateIdmUser = async (userName, externalId) => {
  const idmUser = await IDM.usersClient.findMany({
    user_name: userName,
    application: 'water_vml'
  }, {}, {});

  if (idmUser.data.length === 0) {
    const createIdmUser = {
      user_name: userName,
      user_data: { 'usertype': 'internal', 'firstname': '' },
      application: 'water_vml',
      password: uuid(),
      role: {
        scopes: ['internal']
      },
      reset_required: 1,
      reset_guid: uuid(),
      external_id: externalId
    };

    const newUser = await IDM.usersClient.create(createIdmUser);
    return { created: 1, existing: 0, user: newUser.data };
  }
  return { created: 0, existing: 1, user: idmUser.data[0] };
};

function createAdminUsersUI (request, reply) {
  // View the water index page
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  reply.view('water/admin/createAdminUsers', viewContext);
}

async function create (request, reply) {
  const result = {
    idmUsers: [],
    idm: { created: 0, existing: 0 },
    crm: { created: 0, existing: 0 }
  };

  const regimeId = await getRegimeId();

  const allRequests = request.payload.user_name.map(async userName => {
    try {
      const crmResult = await getOrCreateCrmEntity(userName, regimeId);

      result.crm.created += crmResult.created;
      result.crm.existing += crmResult.existing;

      const idmResult = await getOrCreateIdmUser(userName, crmResult.entity.entity_id);

      result.idm.created += idmResult.created;
      result.idm.existing += idmResult.existing;

      if (idmResult.created) {
        result.idmUsers.push(idmResult.user);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  Promise.all(allRequests)
    .then(() => {
      return reply(result);
    });
}

module.exports = {
  create,
  createAdminUsersUI
};
