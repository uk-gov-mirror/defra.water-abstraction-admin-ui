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
    task_config: createConfigItem('Task Config', 'task_config_id'),
    events: createConfigItem('Events', 'id')
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

async function menu (request, h) {
  const viewContext = View.contextDefaults(request);
  viewContext.viewConfig = viewConfig;
  return h.view('water/admin/standardMenuView', viewContext);
}

async function submenu (request, h) {
  const viewContext = View.contextDefaults(request);
  viewContext.title = request.params.endpoint;
  viewContext.viewConfig = viewConfig[request.params.endpoint];
  return h.view('water/admin/standardSubMenuView', viewContext);
}

async function list (request, reply) {
  const config = viewConfig[request.params.endpoint][request.params.obj];

  if (request.query.id) {
    const viewContext = View.contextDefaults(request);

    try {
      const res = await Endpoints[request.params.endpoint][request.params.obj].findOne(encodeURIComponent(request.query.id));
      if (res.error) {
        console.error(res.error);
      }
      var baseData = res.data;
      var pagination = res.pagination;
    } catch (e) {
      console.error(e);
      throw e;
    }

    viewContext.pageTitle = 'GOV.UK - Admin';
    viewContext.posturl = request.path;
    viewContext.patchurl = request.path + '&patch=true';
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
      return reply.view('water/admin/standardDuplicateView', viewContext);
    } else {
      return reply.view('water/admin/standardEditView', viewContext);
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

    try {
      const res = await Endpoints[request.params.endpoint][request.params.obj].findMany(req.Filter, req.Sort, req.Pagination);

      baseData = res.data;
      pagination = res.pagination;
    } catch (e) {
      console.error(e);
      throw e;
    }

    viewContext.pageTitle = 'GOV.UK - Admin';
    viewContext.key = config.key;
    viewContext.baseurl = request.path.split('?')[0];
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

    viewContext.title = config.title;
    if (pagination && pagination.page) {
      if (pagination.page * pagination.perPage < pagination.totalRows) {
        const qs = [request.path.split('?')[0] + '?'];

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
        const qs = [request.path.split('?')[0] + '?'];

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
    return reply.view('water/admin/standardListView', viewContext);
  }
}

async function createorUpdate (request, reply) {
  for (const key in request.payload) {
    if (request.payload[key] === '') {
      delete request.payload[key];
    }
  }

  if (request.query.patch) {
    for (var key in request.payload) {
      if (request.payload[key] === '' || request.payload[key] === 'null' || request.payload[key] === '{}') {
        delete request.payload[key];
      }
    }

    try {
      const res = await Endpoints[request.params.endpoint][request.params.obj].updateOne(encodeURIComponent(request.query.id), request.payload);
      if (res.error) {
        console.error(res.error.details);
      }
    } catch (e) {
      throw e;
    }

    return reply.redirect(request.path);
  } else {
    try {
      const res = await Endpoints[request.params.endpoint][request.params.obj].create(request.payload);
      if (res.error) {
        console.error(res.error.details);
        throw res.error;
      }
      return res;
    } catch (e) {
      throw e;
    }
  }
}

exports.list = list;
exports.createorUpdate = createorUpdate;
exports.menu = menu;
exports.submenu = submenu;
