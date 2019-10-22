(function () {
    'use strict';

    angular.module('app.users').controller('UsersViewController', UsersViewController);

    UsersViewController.$inject = ['$routeParams', '$uibModal', 'Noty', 'api', 'connection', 'userService', 'gettextCatalog'];

    function UsersViewController ($routeParams, $uibModal, Noty, api, connection, userService, gettextCatalog) {
        const vm = this;

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
        vm.save = save;

        activate();

        function activate () {
            userService.getCurrentUser().then(user => {
                vm.currentUser = user;
                vm.isAdmin = user.isAdmin();
            });

            loadRoles();

            connection.get('/api/admin/users/find-one', { id: $routeParams.userID }).then(function (data) {
                vm.user = data.item;
            });

            connection.get('/api/get-user-counts/' + $routeParams.userID, { userID: $routeParams.userID }).then(function (data) {
                vm.userCounts = data;
            });

            connection.get('/api/get-user-reports/' + $routeParams.userID, { userID: $routeParams.userID }).then(function (data) {
                vm.userReports = data.items;
            });

            connection.get('/api/get-user-dashboards/' + $routeParams.userID, { userID: $routeParams.userID }).then(function (data) {
                vm.userDashboards = data.items;
            });
        };

        function save () {
            return connection.post('/api/admin/users/update/' + vm.user._id, vm.user);
        }

        function changeUserStatus (user) {
            userService.getCurrentUser().then(currentUser => {
                if (currentUser.isAdmin()) {
                    let newStatus;
                    if (user.status === 'active') { newStatus = 'Not active'; }
                    if (user.status === 'Not active') { newStatus = 'active'; }

                    api.changeUserStatus(user._id, newStatus).then(function (result) {
                        user.status = newStatus;
                        new Noty({ text: gettextCatalog.getString('Status updated'), type: 'success' }).show();
                    });
                }
            });
        }

        function getRoleName (roleID) {
            for (var r in vm.roles) {
                if (vm.roles[r]._id === roleID) {
                    return vm.roles[r].name;
                }
            }
        }

        function getRolesNotInUser () {
            var theRoles = [];
            for (var r in vm.roles) {
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
            connection.get('/api/roles/find-all', {}).then(function (data) {
                vm.roles = data.items;

                var adminRole = { _id: 'ADMIN', name: gettextCatalog.getString('Urungi Administrator') };
                vm.roles.push(adminRole);
            });
        }

        function deleteRole (roleID) {
            if (vm.user.userName === 'administrator' && roleID === 'ADMIN') {
                new Noty({ text: gettextCatalog.getString("The role 'Urungi Administrator' can't be removed from the user administrator"), type: 'warning' }).show();
            } else {
                $uibModal.open({
                    component: 'appDeleteModal',
                    resolve: {
                        title: () => gettextCatalog.getString('Remove role {{name}} ?', { name: vm.getRoleName(roleID) }),
                        delete: () => function () {
                            vm.user.roles.splice(vm.user.roles.indexOf(roleID), 1);
                            return vm.save();
                        },
                    },
                });
            }
        }
    }
})();
