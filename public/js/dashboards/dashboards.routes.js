(function () {
    'use strict';

    angular.module('app.dashboards').config(configure);

    configure.$inject = ['$routeProvider'];

    function configure ($routeProvider) {
        $routeProvider.when('/dashboards/view/:dashboardID', {
            templateUrl: 'partials/dashboards/view.html',
            controller: 'DashboardsViewController',
            controllerAs: 'vm',
            resolve: {
                dashboard: function ($route, api) {
                    return api.getDashboard($route.current.params.dashboardID);
                },
            },
            isPublic: true,
        });

        $routeProvider.when('/dashboards/list', {
            templateUrl: 'partials/dashboards/list.html',
            controller: 'DashboardsListController',
            controllerAs: 'vm',
        });

        $routeProvider.when('/dashboards/new/:newDashboard/', {
            templateUrl: 'partials/dashboards/edit.html',
            controller: 'DashboardEditController',
        });

        $routeProvider.when('/dashboards/edit/:dashboardID/', {
            templateUrl: 'partials/dashboards/edit.html',
            controller: 'DashboardEditController',
        });

        $routeProvider.when('/dashboards/push/:dashboardID/', {
            templateUrl: 'partials/dashboards/edit.html',
            controller: 'DashboardEditController',
        });
    }
})();
