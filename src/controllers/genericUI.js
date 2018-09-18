const View = require('./../lib/view');
const Endpoints = {
  crm: require('./../lib/connectors/crm'),
  idm: require('./../lib/connectors/idm'),
  permit: require('./../lib/connectors/permit'),
  water: require('./../lib/connectors/water'),
  returns: require('./../lib/connectors/returns')
};

const createConfigItem = (title, key, editable = true, exclude = []) => ({ title, key, editable, exclude });

const viewConfig = {
  crm: {
    documents: createConfigItem('Documents', 'document_id'),
    verifications: createConfigItem('Verifications', 'verification_id'),
    document_verifications: createConfigItem('Document Verifications', 'document_id', false),
    entities: createConfigItem('Entities', 'entity_id')
  },
  water: {
    notifications: createConfigItem('Scheduled Notifications', 'id'),
    notify_templates: createConfigItem('Notify Templates', 'message_ref'),
    scheduler: createConfigItem('Scheduled Tasks', 'task_id'),
    pending_import: createConfigItem('Imported Licences', 'id'),
    task_config: createConfigItem('Task Config', 'task_config_id')
  },
  idm: {
    users: createConfigItem('Users', 'user_id')
  },
  permit: {
    licences: createConfigItem('Licences', 'licence_id', true, [
      'licence_data_value', 'is_public_domain',
      'licence_search_key', 'licence_regime_id',
      'licence_type_id', 'licence_status_id'
    ]),
    expiring_licences: createConfigItem('Expiring Licences', 'licence_id', false)
  },
  returns: {
    returns: createConfigItem('Returns', 'return_id', true),
    versions: createConfigItem('Versions', 'version_id', true),
    lines: createConfigItem('Lines', 'line_id', true)
  }
};

async function menu (request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.viewConfig = viewConfig;
  reply.view('water/admin/standardMenuView', viewContext);
}

async function submenu (request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.title = request.params.endpoint;
  viewContext.viewConfig = viewConfig[request.params.endpoint];
  reply.view('water/admin/standardSubMenuView', viewContext);
}

async function list (request, reply) {
  const config = viewConfig[request.params.endpoint][request.params.obj];

  if (request.query.id) {
    const viewContext = View.contextDefaults(request);

    console.log(`making request to endpoint ${request.params.endpoint}.${request.params.obj} with filter`);

    try {
      const res = await Endpoints[request.params.endpoint][request.params.obj].findOne(encodeURIComponent(request.query.id));
      if (res.error) {
        console.log(res.error);
      }
      var baseData = res.data;
      var pagination = res.pagination;
    } catch (e) {
      console.log('got error from endpoint');
      console.log(e);
      return reply(e);
    }

    viewContext.pageTitle = 'GOV.UK - Admin';
    viewContext.posturl = request.url.path;
    viewContext.patchurl = request.url.path + '&patch=true';
    viewContext.columns = [];
    viewContext.data = [];

    for (var key in baseData) {
      var data = { name: key, value: baseData[key] };
      if (key === config.key) {
        data.isKey = true;
      }
      data.typeof = typeof data.value;
      data.orginalValue = data.value;

      if (data.typeof === 'object') {
        data.value = JSON.stringify(data.value);
        data.textarea = true;
      }

      if (config.editable) {
        viewContext.editable = true;
      }

      viewContext.data.push(data);
    }

    viewContext.title = config.title;
    viewContext.endpoint = request.params.endpoint;
    viewContext.obj = request.params.obj;
    viewContext.id = request.query.id;

    if (request.query.new) {
      reply.view('water/admin/standardDuplicateView', viewContext);
    } else {
      reply.view('water/admin/standardEditView', viewContext);
    }
  } else {
    // load list view
    var viewContext = View.contextDefaults(request);
    const req = {};
    req.Filter = {};
    req.Sort = {};
    req.Pagination = { page: 1, perPage: config.perPage || 25 };

    if (request.query.page) {
      req.Pagination.page = request.query.page;
    }

    if (request.query.filter) {
      req.Filter = JSON.parse(request.query.filter);
    }

    console.log(`woo... making request to endpoint ${request.params.endpoint}.${request.params.obj}`);
    console.log(req.Filter);

    try {
      const res = await Endpoints[request.params.endpoint][request.params.obj].findMany(req.Filter, req.Sort, req.Pagination);
      console.log('got response from endpoint');

      baseData = res.data;
      pagination = res.pagination;
    } catch (e) {
      console.log('got error from endpoint');
      console.log(e);
      return reply(e);
    }

    viewContext.pageTitle = 'GOV.UK - Admin';
    viewContext.key = config.key;
    viewContext.baseurl = request.url.path.split('?')[0];
    viewContext.columns = [];

    for (const key in baseData[0]) {
      if (!config.exclude.includes(key)) {
        viewContext.columns.push({ name: key });
      }
    }

    viewContext.data = [];

    baseData.forEach((r) => {
      var row = [];
      for (const key in baseData[0]) {
        console.log(key);

        if (!config.exclude.includes(key)) {
          var i = { data: r[key], name: key };
          i.typeof = typeof i.data;
          if (i.typeof === 'object') {
            i.data = JSON.stringify(i.data);
          }

          if (key === config.key) {
            i.isKey = true;
            i.encodeddata = encodeURIComponent(i.data);
          }
          row.push(i);
        }
      }
      viewContext.data.push(row);
    });
    console.log('DATA');
    console.log(viewContext.data);

    viewContext.title = config.title;
    if (pagination && pagination.page) {
      if (pagination.page * pagination.perPage < pagination.totalRows) {
        const qs = [request.url.path.split('?')[0] + '?'];

        if (!request.query.page) {
          request.query.page = 1;
        }
        for (const p in request.query) {
          if (p === 'page') {
            qs.push('page=' + (parseInt(pagination.page) + 1));
          } else {
            qs.push(p + '=' + encodeURIComponent(request.query[p]));
          }
        }

        pagination.nextPage = qs.join('&');
      }

      if (pagination.page > 1) {
        const qs = [request.url.path.split('?')[0] + '?'];

        for (const p in request.query) {
          if (p === 'page') {
            qs.push('page=' + (parseInt(pagination.page) - 1));
          } else {
            qs.push(p + '=' + encodeURIComponent(request.query[p]));
          }
        }

        pagination.previousPage = qs.join('&');
      }
      viewContext.pagination = pagination;
    }
    viewContext.query = request.query;
    viewContext.endpoint = request.params.endpoint;
    viewContext.obj = request.params.obj;
    reply.view('water/admin/standardListView', viewContext);
  }
}

async function createorUpdate (request, reply) {
  const config = viewConfig[request.params.endpoint][request.params.obj];
  console.log(config);
  for (const key in request.payload) {
    if (request.payload[key] === '') {
      delete request.payload[key];
    }
  }

  if (request.query.patch) {
    console.log('request to update');
    const config = viewConfig[request.params.endpoint][request.params.obj];
    console.log(config);
    for (var key in request.payload) {
      if (request.payload[key] === '' || request.payload[key] === 'null' || request.payload[key] === '{}') {
        console.log('delete request.payload.' + key);
        delete request.payload[key];
      }
    }
    console.log(encodeURIComponent(request.query.id));
    console.log(`making request to UPDATE endpoint ${request.params.endpoint}.${request.params.obj} with payload`);

    try {
      const res = await Endpoints[request.params.endpoint][request.params.obj].updateOne(encodeURIComponent(request.query.id), request.payload);
      if (res.error) {
        console.log(res.error.details);
      }
    } catch (e) {
      console.log('bbluergh');
      return reply(e);
    }

    return reply.redirect(request.url.path);
  } else {
    console.log(encodeURIComponent(request.query.id));
    console.log(request.payload);
    console.log(`making request to CREATE  endpoint ${request.params.endpoint}.${request.params.obj} with payload`);
    console.log(request.payload);

    try {
      const res = await Endpoints[request.params.endpoint][request.params.obj].create(request.payload);
      if (res.error) {
        console.log(res.error.details);
        return reply(res.error);
      }
      return reply(res);
    } catch (e) {
      console.log('bbluergh');
      console.log(e);
      return reply(e);
    }
  }
}

module.exports = {
  list,
  createorUpdate,
  menu,
  submenu
};
