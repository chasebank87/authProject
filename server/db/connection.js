const monk = require('monk');

const db = monk('127.0.0.1/auth');

module.exports = db;