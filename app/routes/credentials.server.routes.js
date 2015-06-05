'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var credentials = require('../../app/controllers/credentials.server.controller');

	// Credentials Routes
	app.route('/credentials')
		.get(credentials.list)
		.post(credentials.create);
	app.route('/credentials/authenticate')
		.get(credentials.authorize);

	app.route('/credentials/:credentialId')
		.get(credentials.read)
		.put(credentials.update)
		.delete(credentials.delete);

	// Finish by binding the Credential middleware
	app.param('credentialId', credentials.credentialByID);
};
