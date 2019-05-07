
'use strict';

angular.module('app', [
    'ngRoute', 'ui.sortable', 'draganddrop', 'ui.bootstrap',
    'urungi.directives', 'ngSanitize', 'ui.select', 'angularUUID2', 'vs-repeat',
    'ui.bootstrap.datetimepicker', 'ui.tree', 'page.block', 'bsLoadingOverlay', 'xeditable',
    'intro.help', 'ngFileUpload', 'colorpicker.module',
    'app.inspector', 'gettext', 'ngFileSaver', 'ngclipboard',
    'app.core', 'app.data-sources', 'app.reports', 'app.dashboards',
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

        $routeProvider.when('/dashboards/list/', {
            templateUrl: 'partials/menu-list/dashboardList.html',
            controller: 'dashboardListCtrl'
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

        $routeProvider.when('/reports', {
            templateUrl: 'partials/menu-list/reportList.html',
            controller: 'reportListCtrl'
        });

        $routeProvider.when('/reports/new/', {
            templateUrl: 'partials/report/edit.html',
            controller: 'reportCtrl'
        });
        $routeProvider.when('/reports/edit/:reportID/', {
            templateUrl: 'partials/report/edit.html',
            controller: 'reportCtrl'
        });

        // layers

        $routeProvider.when('/layers', {
            templateUrl: 'partials/menu-list/layerList.html',
            controller: 'layerListCtrl'
        });

        $routeProvider.when('/layers/:layerID/', {
            templateUrl: 'partials/layer/view.html',
            controller: 'layerCtrl'
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

        $routeProvider.when('/users/new/:newUser/', {
            templateUrl: 'partials/users/edit.html',
            controller: 'AdminUsersCtrl'
        });

        $routeProvider.when('/users/edit/:userID/', {
            templateUrl: 'partials/users/edit.html',
            controller: 'AdminUsersCtrl'
        });
        // roles
        $routeProvider.when('/roles', {
            templateUrl: 'partials/roles/list.html',
            controller: 'rolesCtrl'
        });

        $routeProvider.when('/roles/:roleID/', {
            templateUrl: 'partials/roles/view.html',
            controller: 'rolesCtrl'
        });

        $routeProvider.when('/roles/new/:newRole/', {
            templateUrl: 'partials/roles/editNew.html',
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
        // pages
        $routeProvider.when('/pages', {
            templateUrl: 'partials/pages/list.html',
            controller: 'pagesCtrl'
        });
        $routeProvider.when('/page/:extra', {
            templateUrl: 'partials/pages/list.html',
            controller: 'pagesCtrl'
        });

        $routeProvider.when('/pages/:pageID', {
            templateUrl: 'partials/pages/view.html',
            controller: 'pagesCtrl'
        });

        $routeProvider.when('/pages/edit/:pageID/', {
            templateUrl: 'partials/pages/edit.html',
            controller: 'pagesCtrl'
        });

        $routeProvider.when('/pages/new/:newPage/', {
            templateUrl: 'partials/pages/edit.html',
            controller: 'pagesCtrl'
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

        // catalog
        $routeProvider.when('/catalog', {
            templateUrl: 'partials/catalog/view.html',
            controller: 'catalogCtrl'
        });
        $routeProvider.when('/catalog/:extra', {
            templateUrl: 'partials/catalog/view.html',
            controller: 'catalogCtrl'
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

        $routeProvider.when('/export/download', {
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

angular.module('app').run(['$rootScope', '$location', 'sessionStorage', 'connection', function ($rootScope, $location, sessionStorage, connection) {
    // Redirect to /login if next route is not public and user is not authenticated
    $rootScope.$on('$routeChangeStart', function (angularEvent, next, current) {
        const user = sessionStorage.getObject('user');
        if (next.$$route && !next.$$route.redirectTo && !next.$$route.isPublic && !user) {
            window.location.href = '/login';
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

        if ($rootScope.user.contextHelp) {
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

    $rootScope.user = sessionStorage.getObject('user');
    $rootScope.isWSTADMIN = isWSTADMIN($rootScope.user);

    // Refresh user session
    connection.get('/api/get-user-data').then(function (data) {
        const user = data.items.user;
        user.companyData = data.items.companyData;
        user.rolesData = data.items.rolesData;
        user.reportsCreate = data.items.reportsCreate;
        user.dashboardsCreate = data.items.dashboardsCreate;
        user.pagesCreate = data.items.pagesCreate;
        user.exploreData = data.items.exploreData;
        user.isWSTADMIN = data.items.isWSTADMIN;
        user.contextHelp = data.items.contextHelp;
        user.dialogs = data.items.dialogs;
        user.viewSQL = data.items.viewSQL;
        sessionStorage.setObject('user', user);
        $rootScope.user = user;
        $rootScope.isWSTADMIN = isWSTADMIN($rootScope.user);
    }, function () {
        sessionStorage.removeObject('user');
    });
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
