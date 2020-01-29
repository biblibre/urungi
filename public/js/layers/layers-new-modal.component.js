(function () {
    'use strict';

    angular.module('app.layers').component('appLayersNewModal', {
        templateUrl: 'partials/layers/layers-new-modal.html',
        controller: LayersNewModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    LayersNewModalController.$inject = ['$scope', 'api'];

    function LayersNewModalController ($scope, api) {
        const vm = this;

        vm.newLayer = {};
        vm.datasources = [];
        vm.datasource = undefined;
        vm.createLayer = createLayer;

        activate();

        function activate () {
            vm.newLayer.params = {};
            vm.newLayer.status = 'Not active';
            api.getDatasources().then(res => {
                vm.datasources = res.data;
            });
        }

        function createLayer () {
            if ($scope.newLayerForm.$valid) {
                vm.newLayer.datasourceID = vm.datasource._id;
                return api.createLayer(vm.newLayer).then(() => {
                    vm.close();
                });
            }
        }
    }
})();
