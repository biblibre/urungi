(function () {
    'use strict';

    angular.module('app.role-list')
        .controller('RoleListController', RoleListController)
        .component('appRoleList', {
            templateUrl: 'partials/role-list/role-list.component.html',
            controller: 'RoleListController',
            controllerAs: 'vm',
        });

    RoleListController.$inject = ['$uibModal', 'notify', 'i18n', 'expand', 'api'];

    function RoleListController ($uibModal, notify, i18n, expand, api) {
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
                notify.success(i18n.gettext('Role created successfully'));
            }, () => {});
        };

        function view (roleID) {
            return api.getRole(roleID).then(function (role) {
                return openRoleModal(role).then(function () {
                    notify.success(i18n.gettext('Role updated successfully'));
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
                component: 'appRoleListEditModal',
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
                        title: () => expand(i18n.gettext('Remove role {{name}} ?'), { name: role.name }),
                        bodyTemplate: () => 'partials/role-list/role-list.delete-modal-body.html',
                        bodyMessage: () => expand(i18n.ngettext('Warning: This role is assigned to {{$count}} user', 'Warning: This role is assigned to {{$count}} users', usersCount), { $count: usersCount }),
                        usersCount: () => usersCount,
                        delete: () => function () {
                            return api.deleteRole(role._id);
                        },
                    },
                });
                modal.result.then(function () {
                    notify.success(i18n.gettext('Role deleted successfully'));
                    vm.getRoles(1);
                }).catch(() => {});
            });
        }
    }
})();
