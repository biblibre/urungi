(function () {
    'use strict';

    angular.module('app.layers').component('appLayersListButtons', {
        templateUrl: 'partials/layers/layers-list-buttons.html',
        controller: LayersListButtonsController,
        controllerAs: 'vm',
        bindings: {
            layer: '<',
            onDelete: '&',
        },
    });

    LayersListButtonsController.$inject = ['$uibModal', 'Noty', 'api', 'userService', 'gettextCatalog', '$rootScope'];

    function LayersListButtonsController ($uibModal, Noty, api, userService, gettextCatalog, $rootScope) {
        const vm = this;

        vm.openDeleteModal = openDeleteModal;

        function openDeleteModal () {
            const modal = $uibModal.open({
                component: 'appDeleteModal',
                resolve: {
                    title: () => gettextCatalog.getString('Delete {{name}} ?', { name: vm.layer.name }),
                    delete: () => function () {
                        $rootScope.$broadcast('delete-layer');
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
