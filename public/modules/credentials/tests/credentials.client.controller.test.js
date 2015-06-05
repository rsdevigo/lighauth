'use strict';

(function() {
	// Credentials Controller Spec
	describe('Credentials Controller Tests', function() {
		// Initialize global variables
		var CredentialsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, Levels) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Credentials controller.
			CredentialsController = $controller('CredentialsController', {
				$scope: scope
			});

			var sampleLevel = new Levels({
				name: 'New Level'
			});

			// Create a sample Levels array that includes the new Level
			var sampleLevels = [sampleLevel];

			// Set GET response
			$httpBackend.expectGET('levels').respond(sampleLevels);
		}));

		it('$scope.find() should create an array with at least one Credential object fetched from XHR', inject(function(Credentials) {
			// Create sample Credential using the Credentials service
			var sampleCredential = new Credentials({
				description: 'New Credential',
				level: null
			});

			// Create a sample Credentials array that includes the new Credential
			var sampleCredentials = [sampleCredential];

			// Set GET response
			$httpBackend.expectGET('credentials').respond(sampleCredentials);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.credentials).toEqualData(sampleCredentials);
		}));

		it('$scope.findOne() should create an array with one Credential object fetched from XHR using a credentialId URL parameter', inject(function(Credentials) {
			// Define a sample Credential object
			var sampleCredential = new Credentials({
				description: 'New Credential',
				level: null
			});

			// Set the URL parameter
			$stateParams.credentialId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/credentials\/([0-9a-fA-F]{24})$/).respond(sampleCredential);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.credential).toEqualData(sampleCredential);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Credentials) {
			// Create a sample Credential object
			var sampleCredentialPostData = new Credentials({
				description: 'New Credential',
				level: null
			});

			// Create a sample Credential response
			var sampleCredentialResponse = new Credentials({
				_id: '525cf20451979dea2c000001',
				description: 'New Credential',
				level: null
			});

			// Fixture mock form input values
			scope.description = 'New Credential';

			// Set POST response
			$httpBackend.expectPOST('credentials', sampleCredentialPostData).respond(sampleCredentialResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.description).toEqual('');

			// Test URL redirection after the Credential was created
			expect($location.path()).toBe('/credentials/' + sampleCredentialResponse._id);
		}));

		it('$scope.update() should update a valid Credential', inject(function(Credentials) {
			// Define a sample Credential put data
			var sampleCredentialPutData = new Credentials({
				_id: '525cf20451979dea2c000001',
				description: 'New Credential'
			});

			// Mock Credential in scope
			scope.credential = sampleCredentialPutData;

			// Set PUT response
			$httpBackend.expectPUT(/credentials\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			

			// Test URL location to new object
			expect($location.path()).toBe('/credentials/' + sampleCredentialPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid credentialId and remove the Credential from the scope', inject(function(Credentials) {
			// Create new Credential object
			var sampleCredential = new Credentials({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Credentials array and include the Credential
			scope.credentials = [sampleCredential];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/credentials\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleCredential);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.credentials.length).toBe(0);
		}));
	});
}());