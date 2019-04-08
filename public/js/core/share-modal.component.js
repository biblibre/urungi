(function () {
    'use strict';

    angular.module('app.core').component('appShareModal', {
        templateUrl: 'partials/core/share-modal.html',
        controller: ShareModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    ShareModalController.$inject = ['$rootScope'];

    function ShareModalController ($rootScope) {
        const vm = this;

        vm.item = {};
        vm.userObjects = [];
        vm.isWSTADMIN = $rootScope.isWSTADMIN;
        vm.$onInit = $onInit;
        vm.selectThisFolder = selectThisFolder;

        function $onInit () {
            vm.item = vm.resolve.item;
            vm.userObjects = vm.resolve.userObjects;
        }

        function selectThisFolder (folderID) {
            vm.close({ $value: folderID });
        }
    }
})();
