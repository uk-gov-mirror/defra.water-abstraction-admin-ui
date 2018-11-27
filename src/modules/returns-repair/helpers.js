const moment = require('moment');
const { mapKeys, pick, isEqual, isObject } = require('lodash');
const DATE_FORMAT = 'YYYY-MM-DD';

const momentOptions = ['en', {
  week: {
    dow: 0
  }
}];

/**
 * Given the start date for a period, returns the correct NALD period.
 * If the start date is a Sunday, it should return the period unchanged.
 * If the start date is a Monday, it should shift it to the Sat - Sun period.
 * @param {String} startDate - start date of period ISO 8601 YYYY-MM-DD
 * @return {Object} fixed return period
 */
const fixPeriod = (startDate) => {
  return {
    startDate: moment(startDate).locale(...momentOptions).startOf('week').format(DATE_FORMAT),
    endDate: moment(startDate).locale(...momentOptions).endOf('week').format(DATE_FORMAT)
  };
};

/**
 * Repairs the meter key in the meter readings object
 * @param {String} meterKey - a key comprising startDate_endDate
 * @return {String} - key with dates repaired
 */
const repairMeterKey = (meterKey) => {
  const dates = meterKey.split('_');
  const { startDate, endDate } = fixPeriod(dates[0], dates[1]);
  return `${startDate}_${endDate}`;
};

/**
 * Repairs an individual meter entry by rewriting all date keys in the readings
 * @param {Object} meter
 * @return {Object} meter with readings repaired
 */
const repairMeter = (meter) => {
  if (!isObject(meter.readings)) {
    return meter;
  }
  return {
    ...meter,
    readings: mapKeys(meter.readings, (value, key) => repairMeterKey(key))
  };
};

/**
 * Repairs meter readings in return object
 * @param {Object} ret
 * @return {Object} ret
 */
const repairMeterReadings = (ret) => {
  return {
    ...ret,
    meters: ret.meters.map(repairMeter)
  };
};

/**
 * Repairs single line of return
 * @param {Object} line - the return line
 * @return {Object} line
 */
const repairLine = (line) => {
  const { startDate, endDate } = fixPeriod(line.startDate);
  return {
    ...line,
    startDate,
    endDate
  };
};

/**
 * Repairs all return lines in return
 * @param {Object} ret
 * @return {Object}
 */
const repairLines = (ret) => {
  return {
    ...ret,
    lines: ret.lines.map(repairLine)
  };
};

/**
 * Applies a new user account to the return data
 * @param {Object} ret
 * @return {Object}
 */
const applySystemUser = (ret, email, entityId) => {
  return {
    ...ret,
    user: {
      type: 'internal',
      email,
      entityId
    }
  };
};

const incrementVersionNumber = (ret) => {
  const { versionNumber = 1 } = ret;
  return {
    ...ret,
    versionNumber: parseInt(versionNumber) + 1
  };
};

/**
 * Compares the return lines and meters between two returns
 * @param {Object} retA - the first return
 * @param {Object} retB - the second return
 * @return {Boolean} returns true if lines/meters data is the same
 */
const compare = (retA, retB) => {
  const a = pick(retA, ['lines', 'meters']);
  const b = pick(retB, ['lines', 'meters']);
  return isEqual(a, b);
};

const repairWeeklyReturn = (ret, email, entityId) => {
  let updated = repairMeterReadings(ret);
  updated = repairLines(updated);
  updated = applySystemUser(updated, email, entityId);
  updated = incrementVersionNumber(updated);
  return updated;
};

module.exports = {
  fixPeriod,
  repairMeterKey,
  repairMeter,
  repairMeterReadings,
  repairLine,
  repairLines,
  applySystemUser,
  repairWeeklyReturn,
  compare
};
