'use strict';

const Lab = require('lab');
const { experiment, test } = exports.lab = Lab.script();

const { expect } = require('code');
const { showUnlinkAll } = require('../../src/lib/helpers');

experiment('showUnlinkAll', () => {
  test('returns true if the test_mode enabled', async () => {
    const env = { test_mode: true, NODE_ENV: 'development' };
    expect(showUnlinkAll(env)).to.be.true();
  });

  test('returns true if the test_mode value is "1"', async () => {
    const env = { test_mode: '1', NODE_ENV: 'development' };
    expect(showUnlinkAll(env)).to.be.true();
  });

  test('returns true if the NODE_ENV env value is preprod', async () => {
    const env = { test_mode: false, NODE_ENV: 'preprod' };
    expect(showUnlinkAll(env)).to.be.true();
  });

  test('returns false if NODE_ENV is not preprod and not test_mode', async () => {
    const env = { test_mode: false, NODE_ENV: 'prod' };
    expect(showUnlinkAll(env)).to.be.false();
  });
});
