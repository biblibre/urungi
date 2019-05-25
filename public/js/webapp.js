
'use strict';

angular.module('app', [
    'ngRoute', 'ui.sortable', 'draganddrop', 'ui.bootstrap',
    'urungi.directives', 'ngSanitize', 'ui.select', 'angularUUID2', 'vs-repeat',
    'ui.bootstrap.datetimepicker', 'ui.tree', 'page.block', 'bsLoadingOverlay', 'xeditable',
    'intro.help', 'ngFileUpload', 'colorpicker.module',
    'app.inspector', 'gettext', 'ngFileSaver', 'ngclipboard',
    'app.core', 'app.data-sources', 'app.reports', 'app.dashboards',
    'app.layers',
    'app.templates',
])
    .config(['$routeProvider', function ($routeProvider) {
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

        // users

        $routeProvider.when('/users', {
            templateUrl: 'partials/users/list.html',
            controller: 'AdminUsersCtrl'
        });

        $routeProvider.when('/users/:userID/', {
            templateUrl: 'partials/users/view.html',
            controller: 'AdminUsersCtrl'
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
        $routeProvider.when('/shared-space/:extra', {
            templateUrl: 'partials/spaces/index.html',
            controller: 'spacesCtrl'
        });

        // explore
        $routeProvider.when('/explore', {
            templateUrl: 'partials/report/edit.html',
            controller: 'reportCtrl'
        });
        $routeProvider.when('/explore/:extra', {
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
    }]);

angular.module('app').directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind('keydown keypress', function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter, { 'event': event });
                });

                event.preventDefault();
            }
        });
    };
});

angular.module('app').service('reportService', function () {
    var theReport = {};

    var addReport = function (newObj) {
        theReport = newObj;
    };

    var getReport = function () {
        return theReport;
    };

    return {
        addReport: addReport,
        getReport: getReport
    };
});

angular.module('app').run(['$rootScope', '$location', 'connection', 'userService', function ($rootScope, $location, connection, userService) {
    userService.getCurrentUser().then(user => {
        $rootScope.user = user;
        $rootScope.isWSTADMIN = isWSTADMIN($rootScope.user);
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

    $rootScope.removeFromArray = function (array, item) {
        var index = array.indexOf(item);

        if (index > -1) array.splice(index, 1);
    };

    $rootScope.goBack = function () {
        window.history.back();
    };

    $rootScope.getUserContextHelp = function (contextHelpName) {
        var found = false;

        if ($rootScope.user && $rootScope.user.contextHelp) {
            for (var i in $rootScope.user.contextHelp) {
                if ($rootScope.user.contextHelp[i] === contextHelpName) {
                    found = true;
                }
            }
        }

        return !found;
    };

    $rootScope.setUserContextHelpViewed = function (contextHelpName) {
        var params = {};
        params.contextHelpName = contextHelpName;
        connection.get('/api/set-viewed-context-help', params).then(function (data) {
            $rootScope.user.contextHelp = data.items;
        });
    };
}]);

angular.module('app').run(['bsLoadingOverlayService', function (bsLoadingOverlayService) {
    bsLoadingOverlayService.setGlobalConfig({
        delay: 0, // Minimal delay to hide loading overlay in ms.
        activeClass: undefined, // Class that is added to the element where bs-loading-overlay is applied when the overlay is active.
        templateUrl: 'partials/loading-overlay-template.html' // Template url for overlay element. If not specified - no overlay element is created.
    });
}]);

// Set default options for xeditable
angular.module('app').run(['editableOptions', function (editableOptions) {
    editableOptions.buttons = 'no';
}]);

angular.module('app').run(['language', function (language) {
    language.setLanguageFromLocalStorage();
}]);

function isWSTADMIN (user) {
    if (user) {
        return user.roles.some(role => role === 'WSTADMIN');
    }

    return false;
}
