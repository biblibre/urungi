(function () {
    'use strict';

    angular.module('app.user').component('appUserEditModal', {
        templateUrl: 'partials/user/user.edit-modal.component.html',
        controller: UserEditModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    UserEditModalController.$inject = ['i18n', 'api'];

    function UserEditModalController (i18n, api) {
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
                vm.alertMessage = i18n.gettext('You have to introduce the user nick for the new user');
                return;
            }

            if (vm.mode === 'new') {
                if (!vm.user.sendPassword) {
                    if (!vm.user.pwd1) {
                        vm.alertMessage = i18n.gettext('You have to introduce a password');
                        return;
                    } else {
                        if (vm.user.pwd1 !== vm.user.pwd2) {
                            vm.alertMessage = i18n.gettext('Passwords do not match');
                            return;
                        }
                    }
                } else {
                    if (!vm.user.email) {
                        vm.alertMessage = i18n.gettext('You have to introduce a valid email to send the generated password to the user');
                        return;
                    }
                }
            }

            vm.user.password = vm.user.pwd1;

            let p;
            if (vm.mode === 'new') {
                p = api.createUser(vm.user);
            } else {
                p = api.updateUser(vm.user._id, vm.user);
            }

            p.then(function () {
                vm.close({ $value: vm.user });
            });
        }
    }
})();
