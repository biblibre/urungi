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
        'colorpicker.module',
        'gettext',
        'ngclipboard',
        'angular-intro',
        'page.block',
        'app.core',
        'app.about',
        'app.inspector',
        'app.sidebar',
        'app.data-sources',
        'app.reports',
        'app.dashboards',
        'app.layers',
        'app.users',
        'app.roles',
        'app.io',
        'app.themes',
        'app.templates',
    ]);

    angular.module('app').config(configure);

    configure.$inject = ['$routeProvider', '$locationProvider', '$httpProvider', '$uibTooltipProvider', 'Noty', 'base'];

    function configure ($routeProvider, $locationProvider, $httpProvider, $uibTooltipProvider, Noty, base) {
        $locationProvider.html5Mode(true);

        $httpProvider.interceptors.push('httpInterceptor');

        $uibTooltipProvider.options({
            appendToBody: true,
        });

        $routeProvider.otherwise({ redirectTo: '/home' });

        $routeProvider.when('/home', {
            templateUrl: 'partials/home/index.html',
            controller: 'homeCtrl'
        });

        $routeProvider.when('/reports/new/', {
            templateUrl: 'partials/report/edit.html',
            controller: 'reportCtrl'
        });
        $routeProvider.when('/reports/edit/:reportID/', {
            templateUrl: 'partials/report/edit.html',
            controller: 'reportCtrl'
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

        Noty.overrideDefaults({
            layout: 'topRight',
            theme: 'bootstrap-v4',
            timeout: 5000,
        });
    }

    angular.module('app').run(runBlock);

    runBlock.$inject = ['$rootScope', '$location', 'base', 'connection', 'userService', 'language'];

    function runBlock ($rootScope, $location, base, connection, userService, language) {
        userService.getCurrentUser().then(user => {
            $rootScope.user = user;
        }, () => {});

        // Redirect to /login if next route is not public, user is not authenticated and has no active session
        $rootScope.$on('$routeChangeStart', function (angularEvent, next, current) {
            if (next.$$route && !next.$$route.redirectTo && !next.$$route.isPublic) {
                userService.getCurrentUser().then(user => {
                    if (!user) {
                        window.location.href = base + '/login';
                    }
                    if (user.status === 'Not active') {
                        window.location.href = base + '/logout';
                    }
                }, () => {
                    window.location.href = base + '/login';
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
        }, () => {});

        language.initLanguage();

        $rootScope.$on('counts-changes', function () {
            userService.clearCountsCache();
        });
    }
})();
