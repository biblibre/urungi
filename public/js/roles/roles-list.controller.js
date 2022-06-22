(function () {
    'use strict';

    angular.module('app.roles').controller('RolesListController', RolesListController);

    RolesListController.$inject = ['$uibModal', 'notify', 'gettextCatalog', 'api', '$rootScope'];

    function RolesListController ($uibModal, notify, gettextCatalog, api, $rootScope) {
        const vm = this;

        vm.items = [];
        vm.getRoles = getRoles;
        vm.goToPage = goToPage;
        vm.newRole = newRole;
        vm.page = 1;
        vm.view = view;
        vm.deleteRole = deleteRole;

        activate();

        function activate () {
            vm.getRoles(vm.page);
        }

        function newRole () {
            return openRoleModal({}).then(function () {
                notify.success(gettextCatalog.getString('Role created successfully'));
            }, () => {});
        };

        function view (roleID) {
            return api.getRole(roleID).then(function (role) {
                return openRoleModal(role).then(function () {
                    notify.success(gettextCatalog.getString('Role updated successfully'));
                }, () => {});
            });
        };

        function getRoles (page) {
            const params = {
                fields: 'name,description',
                page: page || 1,
            };

            api.getRoles(params).then(function (res) {
                vm.items = res.data;
                vm.page = res.page;
                vm.pages = res.pages;
            });
        };

        function goToPage (page) {
            vm.getRoles(page);
        };

        function openRoleModal (role) {
            const modal = $uibModal.open({
                component: 'appRoleEditModal',
                resolve: {
                    role: role,
                },
            });

            return modal.result.then(function (role) {
                vm.getRoles(vm.page);
            });
        }

        function deleteRole (role) {
            api.getUsers({ fields: 'roles', filters: { roles: role._id } }).then(function (res) {
                const usersCount = res.data.length;
                const modal = $uibModal.open({
                    component: 'appDeleteModal',
                    resolve: {
                        title: () => gettextCatalog.getString('Remove role {{name}} ? - {{usersCount}} user(s) affected', { name: role.name, usersCount: usersCount }),
                        usersCount: () => usersCount,
                        delete: () => function () {
                            return api.deleteRole(role._id);
                        },
                    },
                });
                modal.result.then(function () {
                    $rootScope.$broadcast('counts-changes');
                    notify.success(gettextCatalog.getString('Role deleted successfully'));
                    vm.getRoles(1);
                }).catch(() => {
                    notify.notice(gettextCatalog.getString('Action cancelled'));
                });
            });
        }
    }
})();
