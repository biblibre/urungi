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

    LayersListButtonsController.$inject = ['$uibModal', 'api', 'i18n', 'expand'];

    function LayersListButtonsController ($uibModal, api, i18n, expand) {
        const vm = this;

        vm.openDeleteModal = openDeleteModal;

        function openDeleteModal () {
            const modal = $uibModal.open({
                component: 'appDeleteModal',
                resolve: {
                    title: () => expand(i18n.gettext('Delete {{name}} ?'), { name: vm.layer.name }),
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
