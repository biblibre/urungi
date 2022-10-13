(function () {
    'use strict';

    angular.module('app.users').component('appUsersModifyPasswordModal', {
        templateUrl: 'partials/users/users-modify-password-modal.html',
        controller: UsersModifyPasswordModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    UsersModifyPasswordModalController.$inject = ['gettextCatalog', 'api', 'notify'];

    function UsersModifyPasswordModalController (gettextCatalog, api, notify) {
        const vm = this;
        vm.username = '';
        vm.alertMessage = '';
        vm.submitNewPassword = submitNewPassword;
        vm.togglePasswordVisibility = togglePasswordVisibility;
        vm.inputType = 'password';

        vm.$onInit = $onInit;

        function $onInit () {
            vm.username = angular.copy(vm.resolve.username);
        }

        function togglePasswordVisibility () {
            if (vm.inputType === 'password') {
                vm.inputType = 'text';
            } else {
                vm.inputType = 'password';
            }
        }

        function submitNewPassword () {
            vm.alertMessage = '';

            if (!vm.user.pwdOld) {
                vm.alertMessage = gettextCatalog.getString('You have to introduce your password');
                return;
            } else {
                if (vm.user.pwdNew1 !== vm.user.pwdNew2) {
                    vm.alertMessage = gettextCatalog.getString('Passwords do not match');
                    return;
                }
            }

            const p = api.updateUserPassword({ oldPassword: vm.user.pwdOld, newPassword: vm.user.pwdNew1 });

            p.then(function () {
                vm.close({ $value: vm.user });
                notify.success(gettextCatalog.getString('Password changed'));
            }).catch((error) => {
                vm.alertMessage = gettextCatalog.getString(error);
            });
        }
    }
})();
