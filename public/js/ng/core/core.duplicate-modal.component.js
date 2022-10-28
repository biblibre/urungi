(function () {
    'use strict';

    angular.module('app.core').component('appDuplicateModal', {
        templateUrl: 'partials/core/core.duplicate-modal.component.html',
        controller: DuplicateModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    DuplicateModalController.$inject = ['i18n', 'expand'];

    function DuplicateModalController (i18n, expand) {
        const vm = this;

        vm.newName = '';
        vm.$onInit = $onInit;
        vm.onDuplicate = onDuplicate;

        function $onInit () {
            vm.newName = expand(i18n.gettext('Copy of {{name}}'), { name: vm.resolve.name });
        }

        function onDuplicate () {
            vm.resolve.duplicate(vm.newName).then(function () {
                vm.close();
            });
        }
    }
})();
