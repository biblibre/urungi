(function () {
    'use strict';

    angular.module('app.user-show')
        .controller('UserShowController', UserShowController)
        .component('appUserShow', {
            templateUrl: 'partials/user-show/user-show.component.html',
            controller: 'UserShowController',
            controllerAs: 'vm',
            bindings: {
                userId: '@',
            }
        });

    UserShowController.$inject = ['$window', '$uibModal', 'api', 'connection', 'userService', 'i18n', 'expand', 'notify'];

    function UserShowController ($window, $uibModal, api, connection, userService, i18n, expand, notify) {
        const vm = this;

        vm.$onInit = $onInit;
        vm.addRole = addRole;
        vm.selectedRole = '';
        vm.selectedRoleChanged = false;
        vm.user = {};
        vm.currentUser = {};
        vm.isAdmin = false;
        vm.roles = [];
        vm.userCounts = {};
        vm.userReports = [];
        vm.userDashboards = [];
        vm.editUser = editUser;
        vm.changeUserStatus = changeUserStatus;
        vm.deleteRole = deleteRole;
        vm.getRoleName = getRoleName;
        vm.getRolesNotInUser = getRolesNotInUser;
        vm.deleteUser = deleteUser;
        vm.modifyPassword = modifyPassword;

        function $onInit () {
            userService.getCurrentUser().then(user => {
                vm.currentUser = user;
                vm.isAdmin = user.isAdmin();
            });

            loadRoles();

            api.getUser(vm.userId).then(function (user) {
                vm.user = user;
            });

            api.getUserCounts(vm.userId).then(function (data) {
                vm.userCounts = data;
            });

            api.getUserReports(vm.userId).then(data => {
                vm.userReports = data.items;
            });

            api.getUserDashboards(vm.userId).then(data => {
                vm.userDashboards = data.items;
            });
        };

        function addRole (roleId) {
            vm.selectedRole = '';
            vm.selectedRoleChanged = false;

            return api.addUserRole(vm.user._id, roleId).then(() => {
                vm.user.roles.push(roleId);
            });
        }

        function changeUserStatus (user) {
            userService.getCurrentUser().then(currentUser => {
                if (currentUser.isAdmin()) {
                    let newStatus;
                    if (user.status === 'active') { newStatus = 'Not active'; }
                    if (user.status === 'Not active') { newStatus = 'active'; }

                    api.updateUser(user._id, { status: newStatus }).then(function (result) {
                        user.status = newStatus;
                        notify.success(i18n.gettext('Status updated'));
                    });
                }
            });
        }

        function getRoleName (roleID) {
            for (const r in vm.roles) {
                if (vm.roles[r]._id === roleID) {
                    return vm.roles[r].name;
                }
            }
        }

        function getRolesNotInUser () {
            const theRoles = [];
            for (const r in vm.roles) {
                if (vm.user && vm.user.roles && vm.user.roles.indexOf(vm.roles[r]._id) === -1) {
                    theRoles.push(vm.roles[r]);
                }
            }

            return theRoles;
        };

        function editUser () {
            const modal = $uibModal.open({
                component: 'appUserEditModal',
                resolve: {
                    mode: () => 'edit',
                    user: () => vm.user,
                },
            });

            modal.result.then(function (user) {
                vm.user = user;
            });
        };

        function loadRoles () {
            api.getRoles({ fields: 'name' }).then(function (res) {
                vm.roles = res.data;

                const adminRole = { _id: 'ADMIN', name: i18n.gettext('Urungi Administrator') };
                vm.roles.push(adminRole);
            });
        }

        function deleteRole (roleID) {
            if (vm.user.userName === 'administrator' && roleID === 'ADMIN') {
                notify.notice(i18n.gettext("The role 'Urungi Administrator' can't be removed from the user administrator"));
            } else {
                $uibModal.open({
                    component: 'appDeleteModal',
                    resolve: {
                        title: () => expand(i18n.gettext('Remove role {{name}} ?'), { name: vm.getRoleName(roleID) }),
                        delete: () => function () {
                            return api.deleteUserRole(vm.user._id, roleID).then(() => {
                                vm.user.roles = vm.user.roles.filter(r => r !== roleID);
                            });
                        },
                    },
                });
            }
        }
        function deleteUser (targetUser) {
            if (targetUser._id === vm.currentUser._id) {
                notify.notice(i18n.gettext("You can't remove yourself from your own user session"));
            } else {
                const modal = $uibModal.open({
                    component: 'appDeleteModal',
                    resolve: {
                        title: () => expand(i18n.gettext('Remove user {{name}} ?'), { name: targetUser.userName }),
                        delete: () => function () {
                            return api.deleteUser(targetUser._id);
                        },
                    },
                });

                modal.result.then(function () {
                    $window.location.href = 'users';
                    notify.success(i18n.gettext('User deleted successfully'));
                }
                );
            }
        }

        function modifyPassword () {
            const modal = $uibModal.open({
                component: 'appUsersModifyPasswordModal',
                resolve: {
                    username: () => vm.currentUser.userName,
                },
            });

            modal.result.catch(() => {});
        };
    }
})();
