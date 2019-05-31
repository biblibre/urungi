(function () {
    'use strict';

    angular.module('app', [
        'ngRoute',
        'ngSanitize',
        'ngFileUpload',
        'ngFileSaver',
        'ui.sortable',
        'ui.bootstrap',
        'ui.select',
        'ui.bootstrap.datetimepicker',
        'ui.tree',
        'draganddrop',
        'vs-repeat',
        'xeditable',
        'colorpicker.module',
        'gettext',
        'ngclipboard',
        'angularUUID2',
        'intro.help',
        'page.block',
        'app.core',
        'app.inspector',
        'app.sidebar',
        'app.data-sources',
        'app.reports',
        'app.dashboards',
        'app.layers',
        'app.users',
        'app.templates',
    ]);

    angular.module('app').config(configure);

    configure.$inject = ['$routeProvider', '$locationProvider'];

    function configure ($routeProvider, $locationProvider) {
        // TODO Use the default prefix '!' or use HTML5 mode
        $locationProvider.hashPrefix('');

        $routeProvider.otherwise({ redirectTo: '/home' });

        $routeProvider.when('/home', {
            templateUrl: 'partials/home/index.html',
            controller: 'homeCtrl'
        });

        $routeProvider.when('/about', {
            templateUrl: 'partials/home/about.html',
            controller: 'homeCtrl'
        });

        $routeProvider.when('/dashboards/new/:newDashboard/', {
            templateUrl: 'partials/dashboardv2/edit.html',
            controller: 'dashBoardv2Ctrl'
        });

        $routeProvider.when('/dashboards/edit/:dashboardID/', {
            templateUrl: 'partials/dashboardv2/edit.html',
            controller: 'dashBoardv2Ctrl'
        });

        $routeProvider.when('/dashboards/push/:dashboardID/', {
            templateUrl: 'partials/dashboardv2/edit.html',
            controller: 'dashBoardv2Ctrl'
        });

        $routeProvider.when('/reports/new/', {
            templateUrl: 'partials/report/edit.html',
            controller: 'reportCtrl'
        });
        $routeProvider.when('/reports/edit/:reportID/', {
            templateUrl: 'partials/report/edit.html',
            controller: 'reportCtrl'
        });

        // roles
        $routeProvider.when('/roles', {
            templateUrl: 'partials/roles/list.html',
            controller: 'rolesCtrl'
        });

        $routeProvider.when('/logout', {
            templateUrl: 'partials/logout/index.html',
            controller: 'logOutCtrl'
        });

        // spaces
        $routeProvider.when('/shared-space', {
            templateUrl: 'partials/spaces/index.html',
            controller: 'spacesCtrl'
        });

        // explore
        $routeProvider.when('/explore', {
            templateUrl: 'partials/report/edit.html',
            controller: 'reportCtrl'
        });

        // imports and exports

        $routeProvider.when('/import', {
            templateUrl: 'partials/io/import.html',
            controller: 'ioCtrl'
        });

        $routeProvider.when('/export', {
            templateUrl: 'partials/io/export.html',
            controller: 'ioCtrl'
        });
    }

    angular.module('app').run(runBlock);

    runBlock.$inject = ['$rootScope', '$location', 'editableOptions', 'connection', 'userService', 'language'];

    function runBlock ($rootScope, $location, editableOptions, connection, userService, language) {
        userService.getCurrentUser().then(user => {
            $rootScope.user = user;
            $rootScope.isWSTADMIN = user.isWSTADMIN;
        });

        // Redirect to /login if next route is not public and user is not authenticated
        $rootScope.$on('$routeChangeStart', function (angularEvent, next, current) {
            if (next.$$route && !next.$$route.redirectTo && !next.$$route.isPublic) {
                userService.getCurrentUser().then(user => {
                    if (!user) {
                        window.location.href = '/login';
                    }
                }, () => {
                    window.location.href = '/login';
                });
            }
        });

        $rootScope.$on('$routeChangeError', function (angularEvent, current, previous) {
            $location.url('/');
        });

        $rootScope.goBack = function () {
            window.history.back();
        };

        $rootScope.userContextHelp = [];
        userService.getCurrentUser().then(user => {
            $rootScope.userContextHelp = user.contextHelp;
        });

        // Set default options for xeditable
        editableOptions.buttons = 'no';

        language.setLanguageFromLocalStorage();
    }
})();
