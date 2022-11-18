(function () {
    'use strict';

    angular.module('app.layer-edit').component('appLayerEditAddAllModal', {
        templateUrl: 'partials/layer-edit/layer-edit.add-all-modal.component.html',
        controller: LayerEditAddAllModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    function LayerEditAddAllModalController () {
        const vm = this;

        vm.collection = null;
        vm.$onInit = $onInit;

        function $onInit () {
            vm.collection = vm.resolve.collection;
        }
    }
})();
