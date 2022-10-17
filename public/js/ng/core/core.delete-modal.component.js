(function () {
    'use strict';

    angular.module('app.core').component('appDeleteModal', {
        templateUrl: 'partials/core/core.delete-modal.component.html',
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

        vm.title = '';
        vm.deleteString = '';
        vm.errorMessage = '';
        vm.$onInit = $onInit;
        vm.onDelete = onDelete;

        function $onInit () {
            vm.title = vm.resolve.title;
            vm.bodyTemplate = vm.resolve.bodyTemplate;
        }

        function onDelete () {
            if (vm.deleteString === 'DELETE') {
                vm.resolve.delete().then(function () {
                    vm.close();
                }, function (err) {
                    vm.errorMessage = err;
                });
            }
        }
    }
})();
