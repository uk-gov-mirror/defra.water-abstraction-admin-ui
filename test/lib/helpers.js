'use strict';

const Lab = require('lab');
const { experiment, test } = exports.lab = Lab.script();

const { expect } = require('code');
const { showUnlinkAll } = require('../../src/lib/helpers');

experiment('showUnlinkAll', () => {
  test('returns true if the TEST_MODE enabled', async () => {
    const env = { TEST_MODE: true, NODE_ENV: 'development' };
    expect(showUnlinkAll(env)).to.be.true();
  });

  test('returns true if the TEST_MODE value is "1"', async () => {
    const env = { TEST_MODE: '1', NODE_ENV: 'development' };
    expect(showUnlinkAll(env)).to.be.true();
  });

  test('returns true if the NODE_ENV env value is preprod', async () => {
    const env = { TEST_MODE: false, NODE_ENV: 'preprod' };
    expect(showUnlinkAll(env)).to.be.true();
  });

  test('returns false if NODE_ENV is not preprod and not TEST_MODE', async () => {
    const env = { TEST_MODE: false, NODE_ENV: 'production' };
    expect(showUnlinkAll(env)).to.be.false();
  });
});
