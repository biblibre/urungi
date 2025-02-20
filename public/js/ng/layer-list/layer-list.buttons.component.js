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

    LayersListButtonsController.$inject = ['api', 'i18n', 'expand'];

    function LayersListButtonsController (api, i18n, expand) {
        const vm = this;

        vm.openDeleteModal = openDeleteModal;

        function openDeleteModal () {
            import('../../modal/delete-modal.js').then(({ default: DeleteModal }) => {
                const modal = new DeleteModal({
                    title: expand(i18n.gettext('Delete {{name}} ?'), { name: vm.layer.name }),
                    delete: function () {
                        return api.deleteLayer(vm.layer._id);
                    },
                });
                modal.open().then(() => vm.onDelete(), () => {});
            });
        }
    }
})();
