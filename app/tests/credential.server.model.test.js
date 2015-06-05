'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Level = mongoose.model('Level'),
	Credential = mongoose.model('Credential');

/**
 * Globals
 */
var user, credential, level;

/**
 * Unit tests
 */
describe('Credential Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() {
			level = new Level({
				name: 'Application',
				order: 1,
				user: user
			});

			level.save(function() { 
				credential = new Credential({
					description: 'Credential Name',
					user: user,
					level: level
				});

				done();
			});
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return credential.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without description', function(done) { 
			credential.description = '';

			return credential.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Credential.remove().exec();
		User.remove().exec();
		Level.remove().exec();
		done();
	});
});