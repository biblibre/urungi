(function () {
    'use strict';

    angular.module('app.layer-list').component('appLayerListNewModal', {
        templateUrl: 'partials/layer-list/layer-list.new-modal.component.html',
        controller: LayerListNewModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    LayerListNewModalController.$inject = ['api'];

    function LayerListNewModalController (api) {
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
            if (vm.newLayerForm.$valid) {
                vm.newLayer.datasourceID = vm.datasource._id;
                return api.createLayer(vm.newLayer).then(() => {
                    vm.close();
                });
            }
        }
    }
})();
