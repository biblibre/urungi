(function () {
    'use strict';

    angular.module('app.layer-list').component('appLayersListButtons', {
        templateUrl: 'partials/layer-list/layer-list.buttons.component.html',
        controller: LayersListButtonsController,
        controllerAs: 'vm',
        bindings: {
            layer: '<',
            onDelete: '&',
        },
    });

    LayersListButtonsController.$inject = ['$uibModal', 'api', 'gettextCatalog'];

    function LayersListButtonsController ($uibModal, api, gettextCatalog) {
        const vm = this;

        vm.openDeleteModal = openDeleteModal;

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
