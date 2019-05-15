
'use strict';

const Lab = require('lab');
const { experiment, test } = exports.lab = Lab.script();

const { expect } = require('code');

const { fixPeriod,
  repairMeterKey,
  repairMeter,
  repairMeterReadings,
  repairLines,
  applySystemUser,
  repairWeeklyReturn,
  compare
} = require('../../../src/modules/returns-repair/helpers');

const data = require('./data.json');

experiment('fixPeriod', () => {
  test('Doesnt change period if running Sun - Sat', async () => {
    const result = fixPeriod('2018-10-21');
    expect(result).to.equal({
      startDate: '2018-10-21',
      endDate: '2018-10-27'
    });
  });

  test('Fixes period if running Mon - Sun', async () => {
    const result = fixPeriod('2018-10-22');
    expect(result).to.equal({
      startDate: '2018-10-21',
      endDate: '2018-10-27'
    });
  });
});

experiment('repairMeterKey', () => {
  test('Doesnt change period if running Sun - Sat', async () => {
    const result = repairMeterKey('2018-09-23_2018-09_29');
    expect(result).to.equal('2018-09-23_2018-09-29');
  });

  test('Fixes period if running Mon - Sun', async () => {
    const result = repairMeterKey('2018-09-24_2018-09_30');
    expect(result).to.equal('2018-09-23_2018-09-29');
  });
});

experiment('repairMeter', () => {
  test('It fixes single meter data', async () => {
    const result = repairMeter(data.return.meters[0]);
    expect(result).to.equal(data.correctedMeter);
  });

  test('It should leave meter unchanged if no readings', async () => {
    const { readings, ...meter } = data.return.meters[0];
    const result = repairMeter(meter);
    expect(result).to.equal(meter);
  });
});

experiment('repairMeterReadings', () => {
  test('It fixes meter data within returns', async () => {
    const result = repairMeterReadings(data.return);
    expect(result).to.equal({
      ...data.return,
      meters: [data.correctedMeter]
    });
  });
});

experiment('repairLines', () => {
  test('It fixes a line data', async () => {
    const result = repairLines(data.return);
    expect(result).to.equal({
      ...data.return,
      lines: data.correctedLines
    });
  });
});

experiment('applySystemUser', () => {
  test('Adds user data to return', async () => {
    const result = applySystemUser(data.return, data.adminUser.email, data.adminUser.entityId);
    expect(result).to.equal({
      ...data.return,
      user: data.adminUser
    });
  });
});

experiment('repairWeeklyReturn', () => {
  test('Fixes all elements of weekly return', async () => {
    const result = repairWeeklyReturn(data.return, data.adminUser.email, data.adminUser.entityId);
    expect(result).to.equal({
      ...data.return,
      meters: [data.correctedMeter],
      lines: data.correctedLines,
      user: data.adminUser,
      versionNumber: data.return.versionNumber + 1
    });
  });
});

experiment('compare', () => {
  test('Returns true if return lines and meters are the same', async () => {
    expect(compare(data.return, data.return)).to.equal(true);
  });

  test('Returns false if lines have changed', async () => {
    const ret = {
      ...data.return,
      lines: data.correctedLines
    };
    expect(compare(data.return, ret)).to.equal(false);
  });

  test('Returns false if meters have changed', async () => {
    const ret = {
      ...data.return,
      meters: [data.correctedMeter]
    };
    expect(compare(data.return, ret)).to.equal(false);
  });

  test('Returns false if lines have changed', async () => {
    const ret = {
      ...data.return,
      lines: data.correctedLines
    };
    expect(compare(data.return, ret)).to.equal(false);
  });

  test('Returns false if lines and meters have changed', async () => {
    const ret = {
      ...data.return,
      meters: [data.correctedMeter],
      lines: data.correctedLines
    };
    expect(compare(data.return, ret)).to.equal(false);
  });
});
