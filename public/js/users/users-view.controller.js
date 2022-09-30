(function () {
    'use strict';

    angular.module('app.users').controller('UsersViewController', UsersViewController);

    UsersViewController.$inject = ['$routeParams', '$uibModal', 'api', 'connection', 'userService', 'gettextCatalog', 'notify', '$rootScope', '$location'];

    function UsersViewController ($routeParams, $uibModal, api, connection, userService, gettextCatalog, notify, $rootScope, $location) {
        const vm = this;

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

        activate();

        function activate () {
            userService.getCurrentUser().then(user => {
                vm.currentUser = user;
                vm.isAdmin = user.isAdmin();
            });

            loadRoles();

            api.getUser($routeParams.userID).then(function (user) {
                vm.user = user;
            });

            api.getUserCounts($routeParams.userID).then(function (data) {
                vm.userCounts = data;
            });

            api.getUserReports($routeParams.userID).then(data => {
                vm.userReports = data.items;
            });

            api.getUserDashboards($routeParams.userID).then(data => {
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
                        notify.success(gettextCatalog.getString('Status updated'));
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
                component: 'appUsersEditModal',
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

                const adminRole = { _id: 'ADMIN', name: gettextCatalog.getString('Urungi Administrator') };
                vm.roles.push(adminRole);
            });
        }

        function deleteRole (roleID) {
            if (vm.user.userName === 'administrator' && roleID === 'ADMIN') {
                notify.notice(gettextCatalog.getString("The role 'Urungi Administrator' can't be removed from the user administrator"));
            } else {
                $uibModal.open({
                    component: 'appDeleteModal',
                    resolve: {
                        title: () => gettextCatalog.getString('Remove role {{name}} ?', { name: vm.getRoleName(roleID) }),
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
                    $location.url('/users');
                    notify.success(gettextCatalog.getString('User deleted successfully'));
                }
                );
            }
        }

        function modifyPassword () {
            const modal = $uibModal.open({
                component: 'appUsersModifyPasswordModal',
                resolve: {
                    user: () => vm.currentUser,
                },
            });

            modal.result.then(function (user) {
                vm.currentUser = user;
            });
        };
    }
})();
