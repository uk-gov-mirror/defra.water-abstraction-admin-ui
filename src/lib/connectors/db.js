'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

function promiseQuery (queryString, params) {
  pool.query(queryString, params);
}

module.exports = {
  query: promiseQuery
};
