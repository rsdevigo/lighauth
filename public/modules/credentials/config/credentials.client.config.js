'use strict';

// Configuring the Articles module
angular.module('credentials').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Credentials', 'credentials', 'dropdown', '/credentials(/create)?');
		Menus.addSubMenuItem('topbar', 'credentials', 'List Credentials', 'credentials');
		Menus.addSubMenuItem('topbar', 'credentials', 'New Credential', 'credentials/create');
	}
]);