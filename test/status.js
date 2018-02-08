/**
 * Test verification process
 * - Create entity
 * - Create company
 * - Create unverified document headers linked to entity/company
 * - Create verification code - update documents with ID
 * - Verify with auth code
 * - Update documents with verification ID to verified status
 */
'use strict'
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const moment = require('moment');

const Code = require('code');
const server = require('../index');


lab.experiment('Check status', () => {

  // * @param {String} request.payload.entity_id - the GUID of the current individual's entity
  // * @param {String} request.payload.company_entity_id - the GUID of the current individual's company
  // * @param {String} request.payload.method - the verification method - post|phone
  // * @param {Object} reply - the HAPI HTTP reply
  lab.test('The status page should render', async () => {

    const request = {
      method: 'GET',
      url: `/status`,
    }

    const res = await server.inject(request);
    Code.expect(res.statusCode).to.equal(200);

  })




})
