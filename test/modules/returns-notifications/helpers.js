'use strict';

const Lab = require('lab');
const { experiment, test } = exports.lab = Lab.script();

const { expect } = require('code');

const { getWaterServiceRequest, getReturnDates, getWaterServiceReminderRequest } = require('../../../src/modules/returns-notifications/helpers');

experiment('getWaterServiceRequest', () => {
  test('Builds water service API payload', async () => {
    const data = {
      from: '2016-04-01',
      to: '2017-03-31',
      due: '2017-04-28',
      issuer: 'mail@example.com'
    };

    const payload = getWaterServiceRequest(data);

    expect(payload).to.equal({
      config: {
        rolePriority: [ 'licence_holder' ],
        prefix: 'RINV-',
        issuer: 'mail@example.com',
        messageRef: { default: 'returns_invitation_letter' },
        name: 'Returns: invitation'
      },
      filter: {
        status: 'due',
        end_date: { '$gte': '2016-04-01', '$lte': '2017-03-31' },
        'metadata->>isCurrent': 'true'
      },
      personalisation: {
        date: '28 April 2017'
      }});
  });
});

experiment('getReturnDates', () => {
  test('Builds financial year return dates', async () => {
    const dates = getReturnDates('2017-04-25');
    expect(dates).to.equal({ from: '2017-03-31', to: '2017-03-31', due: '2017-04-28' });
  });

  test('Builds summer return dates after September', async () => {
    const dates = getReturnDates('2018-09-03');
    expect(dates).to.equal({ from: '2018-10-31', to: '2018-10-31', due: '2018-11-28' });
  });
});

experiment('getWaterServiceReminderRequest', () => {
  test('Builds water service API payload', async () => {
    const data = {
      from: '2016-04-01',
      to: '2017-03-31',
      issuer: 'mail@example.com',
      excludeLicences: ' 01/123,456/789\n 10/46/78, 10/46/78 '
    };

    const payload = getWaterServiceReminderRequest(data);

    expect(payload).to.equal({
      'filter': {
        'end_date': {
          '$gte': '2016-04-01',
          '$lte': '2017-03-31'
        },
        'status': 'due',
        'regime': 'water',
        'licence_type': 'abstraction',
        'metadata->>isCurrent': 'true',
        'licence_ref': {
          '$nin': [
            '01/123',
            '456/789',
            '10/46/78'
          ]
        }
      },
      'issuer': 'mail@example.com',
      'name': 'send reminder letters',
      'config': {
        'rolePriority': [
          'returns_to',
          'licence_holder'
        ]
      }
    });
  });
});
