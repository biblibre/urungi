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
    }
})();
