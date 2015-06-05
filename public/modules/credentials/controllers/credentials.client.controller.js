'use strict';

// Credentials controller
angular.module('credentials').controller('CredentialsController', ['$scope', '$stateParams', '$location', '$filter', 'Authentication', 'Credentials', 'Levels',
	function($scope, $stateParams, $location, $filter, Authentication, Credentials, Levels) {
		$scope.authentication = Authentication;

		$scope.levels = Levels.query();
		$scope.level = {_id : null};
		// Create new Credential
		$scope.create = function() {

			if ($scope.level === null) {
				$scope.level = {_id : null};
			}

			// Create new Credential object
			var credential = new Credentials ({
				description: this.description,
				ref: this.ref,
				level: $scope.level._id
			});

			// Redirect after save
			credential.$save(function(response) {
				$location.path('credentials/' + response._id);

				// Clear form fields
				$scope.description = '';
				$scope.ref = '';
				$scope.level = null;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Credential
		$scope.remove = function(credential) {
			if ( credential ) { 
				credential.$remove();

				for (var i in $scope.credentials) {
					if ($scope.credentials [i] === credential) {
						$scope.credentials.splice(i, 1);
					}
				}
			} else {
				$scope.credential.$remove(function() {
					$location.path('credentials');
				});
			}
		};

		// Update existing Credential
		$scope.update = function() {
			var credential = $scope.credential;
			credential.level = $scope.level._id;
			credential.$update(function() {
				$location.path('credentials/' + credential._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Credentials
		$scope.find = function() {
			$scope.credentials = Credentials.query();
		};

		// Find existing Credential
		$scope.findOne = function() {
			$scope.credential = Credentials.get({ 
				credentialId: $stateParams.credentialId
			}, function(data){
				$scope.level = data.level;
				console.log($scope.level);
			});
		};
	}
]);