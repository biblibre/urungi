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

    LayersNewModalController.$inject = ['api'];

    function LayersNewModalController (api) {
        const vm = this;

        vm.newLayer = {};
        vm.createLayer = createLayer;

        activate();

        function activate () {
            vm.newLayer.params = {};
            vm.newLayer.status = 'Not active';
        }

        function createLayer () {
            return api.createLayer(vm.newLayer).then(() => {
                vm.close();
            });
        }
    }
})();
