(function () {
    'use strict';

    angular.module('app.users').component('appUsersEditModal', {
        templateUrl: 'partials/users/users-edit-modal.html',
        controller: UsersEditModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    UsersEditModalController.$inject = ['gettextCatalog', 'connection'];

    function UsersEditModalController (gettextCatalog, connection) {
        const vm = this;

        vm.mode = 'new';
        vm.user = {};
        vm.alertMessage = '';
        vm.checkForNewUser = checkForNewUser;

        vm.$onInit = $onInit;

        function $onInit () {
            vm.mode = vm.resolve.mode;
            vm.user = angular.copy(vm.resolve.user);
        }

        function checkForNewUser () {
            vm.alertMessage = '';

            if (!vm.user.userName) {
                vm.alertMessage = gettextCatalog.getString('You have to introduce the user nick for the new user');
                return;
            }

            if (!vm.user.sendPassword) {
                if (!vm.user.pwd1) {
                    vm.alertMessage = gettextCatalog.getString('You have to introduce a password');
                    return;
                } else {
                    if (vm.user.pwd1 !== vm.user.pwd2) {
                        vm.alertMessage = gettextCatalog.getString('Passwords do not match');
                        return;
                    }
                }
            } else {
                if (!vm.user.email) {
                    vm.alertMessage = gettextCatalog.getString('You have to introduce a valid email to send the generated password to the user');
                    return;
                }
            }

            let p;
            if (vm.mode === 'new') {
                p = connection.post('/api/admin/users/create', vm.user);
            } else {
                p = connection.post('/api/admin/users/update/' + vm.user._id, vm.user);
            }

            p.then(function () {
                vm.close({ $value: vm.user });
            });
        }
    }
})();
