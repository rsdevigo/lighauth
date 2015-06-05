'use strict';

//Setting up route
angular.module('credentials').config(['$stateProvider',
	function($stateProvider) {
		// Credentials state routing
		$stateProvider.
		state('listCredentials', {
			url: '/credentials',
			templateUrl: 'modules/credentials/views/list-credentials.client.view.html'
		}).
		state('createCredential', {
			url: '/credentials/create',
			templateUrl: 'modules/credentials/views/create-credential.client.view.html'
		}).
		state('viewCredential', {
			url: '/credentials/:credentialId',
			templateUrl: 'modules/credentials/views/view-credential.client.view.html'
		}).
		state('editCredential', {
			url: '/credentials/:credentialId/edit',
			templateUrl: 'modules/credentials/views/edit-credential.client.view.html'
		});
	}
]);