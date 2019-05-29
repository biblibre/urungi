(function () {
    'use strict';

    angular.module('app.users').config(configure);

    configure.$inject = ['$routeProvider'];

    function configure ($routeProvider) {
        $routeProvider.when('/users', {
            templateUrl: 'partials/users/list.html',
            controller: 'UsersListController',
            controllerAs: 'vm',
        });

        $routeProvider.when('/users/:userID', {
            templateUrl: 'partials/users/view.html',
            controller: 'UsersViewController',
            controllerAs: 'vm',
        });
    }
})();
