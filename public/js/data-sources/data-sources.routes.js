(function () {
    'use strict';

    angular.module('app.data-sources').config(configure);

    configure.$inject = ['$routeProvider'];

    function configure ($routeProvider) {
        $routeProvider.when('/data-sources', {
            templateUrl: 'partials/data-sources/list.html',
            controller: 'DataSourcesListController',
            controllerAs: 'vm',
        });

        $routeProvider.when('/data-sources/:dataSourceID', {
            templateUrl: 'partials/data-sources/edit.html',
            controller: 'DataSourcesEditController',
            controllerAs: 'vm',
        });
    }
})();
