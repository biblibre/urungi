(function () {
    'use strict';

    angular.module('app.roles').config(configure);

    configure.$inject = ['$routeProvider'];

    function configure ($routeProvider) {
        $routeProvider.when('/roles', {
            templateUrl: 'partials/roles/list.html',
            controller: 'RolesListController',
            controllerAs: 'vm',
        });
    }
})();
