(function () {
    'use strict';

    angular.module('app.users').controller('UsersListController', UsersListController);

    UsersListController.$inject = ['$uibModal', 'Noty', 'gettextCatalog', 'api', 'userService'];

    function UsersListController ($uibModal, Noty, gettextCatalog, api, userService) {
        const vm = this;

        vm.page = 1;
        vm.pages = 1;
        vm.users = [];
        vm.getUsers = getUsers;
        vm.changeUserStatus = changeUserStatus;
        vm.goToPage = goToPage;
        vm.newUser = newUser;

        activate();

        function activate () {
            vm.getUsers(1);
        }

        function changeUserStatus (user) {
            userService.getCurrentUser().then(currentUser => {
                if (currentUser.isAdmin()) {
                    let newStatus;
                    if (user.status === 'active') { newStatus = 'Not active'; }
                    if (user.status === 'Not active') { newStatus = 'active'; }

                    api.updateUser(user._id, { status: newStatus }).then(function (result) {
                        user.status = newStatus;
                        new Noty({ text: gettextCatalog.getString('Status updated'), type: 'success' }).show();
                    });
                }
            });
        };

        function getUsers (page) {
            var params = {
                page: page || 1,
                fields: 'userName,lastName,status',
            };

            api.getUsers(params).then(function (res) {
                vm.users = res.data;
                vm.page = res.page;
                vm.pages = res.pages;
            });
        };

        function goToPage (page) {
            vm.getUsers(page);
        };

        function newUser () {
            const modal = $uibModal.open({
                component: 'appUsersEditModal',
                resolve: {
                    mode: () => 'new',
                    user: () => ({
                        roles: [],
                        status: 'active',
                        sendPassword: true,
                    }),
                },
            });

            modal.result.then(function () {
                vm.getUsers(vm.page);
            });
        };
    }
})();
