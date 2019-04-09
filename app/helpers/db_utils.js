"use strict";

const nconf = require('../../config/config');
const neo4j = require('neo4j-driver').v1;


const driver = neo4j.driver(nconf.get('neo4j-local'), neo4j.auth.basic(nconf.get('neo4j-username'), nconf.get('neo4j-password')));

if (nconf.get('neo4j') == 'remote') {
  driver = neo4j.driver(nconf.get('neo4j-remote'), neo4j.auth.basic(nconf.get('neo4j-username'), nconf.get('neo4j-username')));
}


exports.getSession = function () {
    return driver.session();
};