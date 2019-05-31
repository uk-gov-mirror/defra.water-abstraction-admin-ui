const Joi = require('@hapi/joi');
const controller = require('./controller');

module.exports = {
  getPicklists: {
    method: 'GET',
    path: '/admin/picklists',
    handler: controller.getPicklists,
    config: {
      description: 'View list of picklists'
    }
  },

  getPicklist: {
    method: 'GET',
    path: '/admin/picklist/{id}',
    handler: controller.getPicklist,
    config: {
      description: 'View single picklist',
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    }
  },

  getCreateItem: {
    method: 'GET',
    path: '/admin/picklist/{id}/create-item',
    handler: controller.getCreateItem,
    config: {
      description: 'Create picklist item',
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    }
  },

  postCreateItem: {
    method: 'POST',
    path: '/admin/picklist/{id}/create-item',
    handler: controller.postCreateItem,
    config: {
      description: 'Post handler for create picklist item',
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    }
  },

  getEditItem: {
    method: 'GET',
    path: '/admin/picklist/{id}/edit-item/{itemId}',
    handler: controller.getEditItem,
    config: {
      description: 'Edit picklist item',
      validate: {
        params: {
          id: Joi.string().required(),
          itemId: Joi.string().required()
        }
      }
    }
  },

  postEditItem: {
    method: 'POST',
    path: '/admin/picklist/{id}/edit-item/{itemId}',
    handler: controller.postEditItem,
    config: {
      description: 'POST handler for edit picklist item',
      validate: {
        params: {
          id: Joi.string().required(),
          itemId: Joi.string().required()
        }
      }
    }
  }

};
