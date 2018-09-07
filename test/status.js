'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();

const Code = require('code');
const server = require('../index');

lab.experiment('Check status', () => {
  lab.test('The status page should render', async () => {
    const request = { method: 'GET', url: `/status` };
    const res = await server.inject(request);
    Code.expect(res.statusCode).to.equal(200);
  });
});
