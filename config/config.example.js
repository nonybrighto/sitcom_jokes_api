'use strict';

const nconf = require('nconf');

nconf.defaults({
	'api-v1-url': 'http://localhost:3000/api/v1/',
	'neo4j-username': '',
	'neo4j-password' : '',
	'env': 'development',
	'neo4j': 'local',
	'neo4j-local': 'bolt://localhost',
	'neo4j-remote': 'bolt:http://162.243.100.222:7687',
	'base-url': 'http://localhost:3000/',
	'gmail-email':'nonybrighto@gmail.com',
	'gmail-password':'will_be_added_when_needed',
	'email-host':'email-server host',
	'email-port':587,
	'email-user':'user',
	'email-password':'password',
	'jwt-secret': '0a6b357d-d2fb-46fc-a84e-0295a986cd9f',
	'uuid-namespace': '1b512364-41d5-456e-54b0-cda1fe1f3341',
	'facebook-client-id':'',
	'facebook-client-secret':'',
	'google-client-id':'',
	'password-token-expire-hrs':2

});

module.exports = nconf;