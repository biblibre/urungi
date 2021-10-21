(function () {
    'use strict';

    angular.module('app.users').controller('UsersListController', UsersListController);

    UsersListController.$inject = ['$uibModal', 'notify', 'gettextCatalog', 'api', 'userService', '$rootScope'];

    function UsersListController ($uibModal, notify, gettextCatalog, api, userService, $rootScope) {
        const vm = this;

        vm.page = 1;
        vm.pages = 1;
        vm.users = [];
        vm.getUsers = getUsers;
        vm.changeUserStatus = changeUserStatus;
        vm.goToPage = goToPage;
        vm.newUser = newUser;
        vm.currentUser = {};
        vm.isAdmin = false;
        vm.editUser = editUser;
        vm.deleteUser = deleteUser;

        activate();

        function activate () {
            userService.getCurrentUser().then(user => {
                vm.currentUser = user;
                vm.isAdmin = user.isAdmin();
            });
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
                        notify.success(gettextCatalog.getString('Status updated'));
                    });
                }
            });
        };

        function getUsers (page) {
            const params = {
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

        function editUser (user) {
            const targetUser = api.getUser(user._id);
            const modal = $uibModal.open({
                component: 'appUsersEditModal',
                resolve: {
                    mode: () => 'edit',
                    user: () => targetUser,
                },
            });

            modal.result.then(function () {
                vm.getUsers(1);
            });
        };

        function deleteUser (targetUser) {
            if (targetUser._id === vm.currentUser._id) {
                notify.notice(gettextCatalog.getString("You can't remove yourself from your own user session"));
            } else {
                const modal = $uibModal.open({
                    component: 'appDeleteModal',
                    resolve: {
                        title: () => gettextCatalog.getString('Remove user {{name}} ?', { name: targetUser.userName }),
                        delete: () => function () {
                            return api.deleteUser(targetUser._id);
                        },
                    },
                });

                modal.result.then(function () {
                    $rootScope.$broadcast('counts-changes');
                    notify.success(gettextCatalog.getString('User deleted successfully'));
                    vm.getUsers(1);
                });
            }
        }
    }
})();
