'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Credential = mongoose.model('Credential'),
	Level = mongoose.model('Level'),
	Q = require('q'),
	crypto = require('crypto'),
	_ = require('lodash');

/**
 * Create a Credential
 */
exports.create = function(req, res) {
	var credential = new Credential(req.body);
	if (req.user !== undefined)
		credential.user = req.user;

	credential.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(credential);
		}
	});
};

/**
 * Show the current Credential
 */
exports.read = function(req, res) {
	res.jsonp(req.credential);
};

/**
 * Update a Credential
 */
exports.update = function(req, res) {
	var credential = req.credential ;

	credential = _.extend(credential , req.body);

	credential.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(credential);
		}
	});
};

/**
 * Delete an Credential
 */
exports.delete = function(req, res) {
	var credential = req.credential ;

	credential.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(credential);
		}
	});
};

/**
 * List of Credentials
 */
exports.list = function(req, res) { 
	Credential.find().sort('-created').populate('user level').exec(function(err, credentials) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(credentials);
		}
	});
};

/**
 * Credential middleware
 */
exports.credentialByID = function(req, res, next, id) { 
	Credential.findById(id).populate('user level').exec(function(err, credential) {
		if (err) return next(err);
		if (! credential) return next(new Error('Failed to load Credential ' + id));
		req.credential = credential ;
		next();
	});
};

/**
 * Credential authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.credential.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

function numberOfNotNull(collection) {
	var len = _.size(collection);
	var notNull = 0;
	for (var i = 0; i < len; i++)
		if (collection[i] !== undefined)
			notNull++;
	return notNull;
}

function checkLevels(collection) {
	var len = _.size(collection);
	var notNull = numberOfNotNull(collection);
	for (var i = 0; i < len; i++)
		if (collection[i] === undefined && i < notNull)
			return i;
	return true;
}

function getCredentials(keys) {
	var credentials = [];

    var dfd = Q.defer();
    var promise;
 
    dfd.resolve();
    promise = dfd.promise;
 
    _.each(keys, function(key) {
    	if (key !== undefined)
	        promise = promise.then(function() {
	            return Credential.findById(key).exec(function(err, credential){
	            	if (err)
	            		throw new Error(err);

	            	return credential;
	            });
	        }).then(function(c) {
	            credentials.push(c);
	        }).catch(function(error) {
	        	throw error;
	        });
    });
 
    return promise.then(function() {
        return credentials;
    }).catch(function(error) {
    	throw error;
	});
}


exports.authorize = function(req, res) {
	// First get the levels avaiable and sort by order
	var time = req.get('x-sauth-time');
	if (time === undefined) {
		return res.status(400).send({
			message: 'x-sauth-time is missing'
		});
	}

	Level.find().sort('order').populate('user level').exec(function(err, levels) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// Then for each level get the correspondent header 
			var signs = [];
			var keys = [];
			_.each(levels, function(level) {
				signs.push(req.get('x-sauth-'+level.name.toLowerCase()+'-signature'));
				keys.push(req.get('x-sauth-'+level.name.toLowerCase()+'-key'));
			});

			if (numberOfNotNull(signs) !== numberOfNotNull(keys)) {
				return res.status(400).send({
					message: 'number of signatures headers and keys headers do not match'
				});
			}

			if (true !== checkLevels(signs)) {
				return res.status(400).send({
					message: 'x-sauth-'+levels[checkLevels(signs)].name.toLowerCase()+'-signature header missing, level:' + levels[checkLevels(signs)].name
				});
			}

			if (true !== checkLevels(keys)) {
				return res.status(400).send({
					message: 'x-sauth-'+levels[checkLevels(keys)].name.toLowerCase()+'-key header missing, level:' + levels[checkLevels(keys)].name
				});
			}

			// Then get the credentials for each level
			getCredentials(keys).then(function(credentials){
				// Then try sign the credentials

				var i = 0;
				_.each(credentials, function(credential) {
					if (credential === undefined)
						throw new Error('');
					var token = credential.token;
					var hmacObj = crypto.createHmac('sha1', credential.id);
					var sign = hmacObj.update(credential.token+time).digest('hex');
					if (sign !== signs[i])
						return res.status(401).send({
							message: 'Signature with key '+credential.id+' is invalid.'
						});
					i++;
				});

				return res.status(200).send({
					message: true
				});
			}).catch(function(error){
				return res.status(500).send({
					message: 'Ops ! Something is Wrong! When we tries get the credentials'
				});
			});
			
		}
	});
};