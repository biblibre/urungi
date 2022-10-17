(function () {
    'use strict';

    angular.module('app.user-show').component('appUsersModifyPasswordModal', {
        templateUrl: 'partials/user-show/user-show.users-modify-password-modal.component.html',
        controller: UsersModifyPasswordModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    UsersModifyPasswordModalController.$inject = ['i18n', 'api', 'notify'];

    function UsersModifyPasswordModalController (i18n, api, notify) {
        const vm = this;
        vm.username = '';
        vm.alertMessage = '';
        vm.submitNewPassword = submitNewPassword;
        vm.togglePasswordVisibility = togglePasswordVisibility;
        vm.inputType = 'password';

        vm.$onInit = $onInit;

        function $onInit () {
            vm.username = vm.resolve.username;
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
                vm.alertMessage = i18n.gettext('You have to introduce your password');
                return;
            } else {
                if (vm.user.pwdNew1 !== vm.user.pwdNew2) {
                    vm.alertMessage = i18n.gettext('Passwords do not match');
                    return;
                }
            }

            const p = api.updateUserPassword({ oldPassword: vm.user.pwdOld, newPassword: vm.user.pwdNew1 });

            p.then(function () {
                vm.close();
                notify.success(i18n.gettext('Password changed'));
            }).catch((error) => {
                vm.alertMessage = i18n.gettext(error);
            });
        }
    }
})();
