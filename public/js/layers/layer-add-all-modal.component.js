(function () {
    'use strict';

    angular.module('app.layers').component('appLayerAddAllModal', {
        templateUrl: 'partials/layers/layer-add-all-modal.html',
        controller: LayerAddAllModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    function LayerAddAllModalController () {
        const vm = this;

        vm.collection = null;
        vm.$onInit = $onInit;

        function $onInit () {
            vm.collection = vm.resolve.collection;
        }
    }
})();
