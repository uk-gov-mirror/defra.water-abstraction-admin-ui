'use strict';

const { experiment, test } = exports.lab = require('@hapi/lab').script();
const { expect } = require('@hapi/code');

const { getWaterServiceRequest, getReturnDates } = require('../../../src/modules/returns-notifications/helpers');

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
        rolePriority: ['licence_holder'],
        prefix: 'RINV-',
        issuer: 'mail@example.com',
        messageRef: { default: 'returns_invitation_letter' },
        name: 'Returns: invitation'
      },
      filter: {
        status: 'due',
        end_date: { $gte: '2016-04-01', $lte: '2017-03-31' },
        'metadata->>isCurrent': 'true'
      },
      personalisation: {
        date: '28 April 2017'
      }
    });
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
