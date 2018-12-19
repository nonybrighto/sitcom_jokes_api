'use strict';

var nconf = require('nconf');

nconf.defaults({
	'neo4j-username': 'username',
	'neo4j-password' : 'password',
	'env': 'development',
	'neo4j': 'local',
	'neo4j-local': 'bolt://localhost:7687',
	'base_url': 'http://localhost:3000',
	'api_path': '/api/v0'
});

module.exports = nconf;