(function () {
    'use strict';

    angular.module('app.io').config(configure);

    configure.$inject = ['$routeProvider'];

    function configure ($routeProvider) {
        $routeProvider.when('/import', {
            templateUrl: 'partials/io/import.html',
            controller: 'ImportController',
            controllerAs: 'vm',
        });
        $routeProvider.when('/export', {
            templateUrl: 'partials/io/export.html',
            controller: 'ExportController',
            controllerAs: 'vm',
        });
    }
})();
