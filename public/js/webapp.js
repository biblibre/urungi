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
        'toastr'
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

    runBlock.$inject = ['$rootScope', '$window', '$location', '$timeout', 'gettextCatalog', 'base', 'userService', 'language', 'api', 'Noty'];

    function runBlock ($rootScope, $window, $location, $timeout, gettextCatalog, base, userService, language, api, Noty) {
        userService.getCurrentUser().then(user => {
            $rootScope.user = user;
        }, () => {});

        // Redirect to /login if next route is not public, user is not authenticated and has no active session
        $rootScope.$on('$routeChangeStart', function (angularEvent, next, current) {
            if (next.$$route && !next.$$route.redirectTo && !next.$$route.isPublic) {
                api.getUserData().then(user => {
                    if (!user) {
                        throw new Error();
                    }
                }).catch(() => {
                    const text = gettextCatalog.getString('You have been logged out. You will be redirected to the login page.');
                    new Noty({ text, type: 'error', timeout: false }).show();

                    $timeout(() => {
                        $window.location.href = base + '/login';
                    }, 2000);
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
