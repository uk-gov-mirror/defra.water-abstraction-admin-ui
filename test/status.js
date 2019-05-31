'use strict';

const { experiment, test } = exports.lab = require('@hapi/lab').script();
const { expect } = require('@hapi/code');

const server = require('../index');

experiment('Check status', () => {
  test('The status page should render', async () => {
    const request = { method: 'GET', url: `/admin/status` };
    const res = await server.inject(request);
    expect(res.statusCode).to.equal(200);
  });
});
