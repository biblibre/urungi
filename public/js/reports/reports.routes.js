(function () {
    'use strict';

    angular.module('app.reports').config(configure);

    configure.$inject = ['$routeProvider'];

    function configure ($routeProvider) {
        $routeProvider.when('/reports/view/:reportID', {
            templateUrl: 'partials/reports/view.html',
            controller: 'ReportsViewController',
            controllerAs: 'vm',
            resolve: {
                report: function ($route, reportModel) {
                    return reportModel.getReportDefinition($route.current.params.reportID, false);
                },
            },
            isPublic: true,
        });

        $routeProvider.when('/reports', {
            templateUrl: 'partials/reports/list.html',
            controller: 'ReportsListController',
            controllerAs: 'vm',
        });
    }
})();
