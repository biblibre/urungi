(function () {
    'use strict';

    angular.module('app.layers').component('appLayersListItem', {
        templateUrl: 'partials/layers/layers-list-item.html',
        controller: LayersListItemController,
        controllerAs: 'vm',
        bindings: {
            layer: '<',
            onDelete: '&',
        },
    });

    LayersListItemController.$inject = ['$rootScope', '$uibModal', 'api'];

    function LayersListItemController ($rootScope, $uibModal, api) {
        const vm = this;

        vm.toggleActive = toggleActive;
        vm.openDeleteModal = openDeleteModal;

        function toggleActive () {
            if ($rootScope.isWSTADMIN) {
                const newStatus = vm.layer.status === 'active' ? 'Not active' : 'active';

                api.changeLayerStatus(vm.layer._id, newStatus).then(() => {
                    vm.layer.status = newStatus;
                });
            }
        }

        function openDeleteModal () {
            const modal = $uibModal.open({
                component: 'appDeleteModal',
                resolve: {
                    name: () => vm.layer.name,
                    delete: () => function () {
                        return api.deleteLayer(vm.layer._id);
                    },
                },
            });
            modal.result.then(function () {
                vm.onDelete();
            });
        }
    }
})();
