(function () {
    'use strict';

    angular.module('app.about').config(configure);

    configure.$inject = ['$routeProvider'];

    function configure ($routeProvider) {
        $routeProvider.when('/about', {
            templateUrl: 'partials/home/about.html',
            controller: 'AboutController',
            controllerAs: 'vm',
        });
    }
})();
