(function () {
    'use strict';

    angular.module('app.roles').controller('RolesListController', RolesListController);

    RolesListController.$inject = ['$uibModal', 'toastr', 'gettextCatalog', 'api'];

    function RolesListController ($uibModal, toastr, gettextCatalog, api) {
        const vm = this;

        vm.items = [];
        vm.getRoles = getRoles;
        vm.goToPage = goToPage;
        vm.newRole = newRole;
        vm.page = 1;
        vm.view = view;

        activate();

        function activate () {
            vm.getRoles(vm.page);
        }

        function newRole () {
            return openRoleModal({}).then(function () {
                toastr.success(gettextCatalog.getString('Role created successfully'));
            }, () => {});
        };

        function view (roleID) {
            return api.getRole(roleID).then(function (role) {
                return openRoleModal(role).then(function () {
                    toastr.success(gettextCatalog.getString('Role updated successfully'));
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
    }
})();
