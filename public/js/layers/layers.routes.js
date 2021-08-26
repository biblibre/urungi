(function () {
    'use strict';

    angular.module('app.layers').config(configure);

    configure.$inject = ['$routeProvider'];

    function configure ($routeProvider) {
        $routeProvider.when('/layers', {
            templateUrl: 'partials/layers/list.html',
            controller: 'LayersListController',
            controllerAs: 'vm',
        });

        $routeProvider.when('/layers/:layerID', {
            templateUrl: 'partials/layer/view.html',
            controller: 'LayerViewController',
            controllerAs: 'vm',
        });
    }
})();
