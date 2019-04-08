(function () {
    'use strict';

    angular.module('app.core').component('appDeleteModal', {
        templateUrl: 'partials/core/delete-modal.html',
        controller: DeleteModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    function DeleteModalController () {
        const vm = this;

        vm.deleteString = '';
        vm.onDelete = onDelete;

        function onDelete () {
            vm.resolve.delete().then(function () {
                vm.close();
            });
        }
    }
})();
