(function () {
    'use strict';

    angular.module('app.core').component('appDuplicateModal', {
        templateUrl: 'partials/core/duplicate-modal.html',
        controller: DuplicateModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    function DuplicateModalController () {
        const vm = this;

        vm.newName = '';
        vm.$onInit = $onInit;
        vm.onDuplicate = onDuplicate;

        function $onInit () {
            vm.newName = 'Copy of ' + vm.resolve.name;
        }

        function onDuplicate () {
            vm.resolve.duplicate(vm.newName).then(function () {
                vm.close();
            });
        }
    }
})();
