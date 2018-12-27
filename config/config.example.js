'use strict';

var nconf = require('nconf');

nconf.defaults({
	'neo4j-username': 'username',
	'neo4j-password' : 'password',
	'env': 'development',
	'neo4j': 'local',
	'neo4j-local': 'bolt://localhost',
	'neo4j-remote': 'bolt:http://162.243.100.222:7687',
	'base_url': 'http://localhost:3000',
	'api_path': '/api/v0',
	'gmail-email':'nonybrighto@gmail.com',
	'gmail-password':'will_be_added_when_needed',
	'email-host':'email-server host',
	'email-port':587,
	'email-user':'user',
	'email-password':'password',
	'jwt-secret': '0a6a257d-d3fe-45fc-a35e-0295c986cd9f',
	'uuid-namespace': '1b514e64-41d5-591e-54b0-cd01fe1f3341',
	'auth0-domain':'nonyapp.auth0.com',
	'auth0-api-audience':'http://localhost:3000/api/v1/',
	'facebook-client-id':'cleint_id',
	'facebook-client-secret':'secret',
	'google-client-id':'id',
	'google-client-secret':'',
	'password-token-expire-hrs':2

});

module.exports = nconf;