(function () {
    'use strict';

    angular.module('app.share').component('appShareModal', {
        templateUrl: 'partials/share/share.share-modal.component.html',
        controller: ShareModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    ShareModalController.$inject = ['userService'];

    function ShareModalController (userService) {
        const vm = this;

        vm.item = {};
        vm.userObjects = [];
        vm.isAdmin = false;
        vm.$onInit = $onInit;
        vm.selectThisFolder = selectThisFolder;

        function $onInit () {
            vm.item = vm.resolve.item;
            vm.userObjects = vm.resolve.userObjects.items;
            userService.getCurrentUser().then(user => {
                vm.isAdmin = user.isAdmin();
            });
        }

        function selectThisFolder (folderID) {
            vm.close({ $value: folderID });
        }
    }
})();
