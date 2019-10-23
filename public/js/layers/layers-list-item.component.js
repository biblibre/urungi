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

    LayersListItemController.$inject = ['$uibModal', 'Noty', 'api', 'userService', 'gettextCatalog'];

    function LayersListItemController ($uibModal, Noty, api, userService, gettextCatalog) {
        const vm = this;

        vm.toggleActive = toggleActive;
        vm.openDeleteModal = openDeleteModal;

        function toggleActive () {
            userService.getCurrentUser().then(user => {
                if (user.isAdmin()) {
                    const newStatus = vm.layer.status === 'active' ? 'Not active' : 'active';

                    api.changeLayerStatus(vm.layer._id, newStatus).then(() => {
                        vm.layer.status = newStatus;
                        new Noty({ text: gettextCatalog.getString('Status updated'), type: 'success' }).show();
                    });
                }
            });
        }

        function openDeleteModal () {
            const modal = $uibModal.open({
                component: 'appDeleteModal',
                resolve: {
                    title: () => gettextCatalog.getString('Delete {{name}} ?', { name: vm.layer.name }),
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
