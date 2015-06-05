'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	randtoken = require('rand-token');

/**
 * Credential Schema
 */
var CredentialSchema = new Schema({
	description: {
		type: String,
		default: '',
		required: 'Please fill Credential description',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	ref: {
		type: String,
		default: ''
	},
	level: {
		type: Schema.ObjectId,
		ref: 'Level',
		required: 'Please select some level to credential'
	},
	token: {
		type: String
	}
});

CredentialSchema.pre('save', function(next) {
	if (!this.token) {
		this.token = randtoken.generate(40);
	}
	next();
});

mongoose.model('Credential', CredentialSchema);