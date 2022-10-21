(function () {
    'use strict';

    angular.module('app.dashboards').component('appDashboardsListButtons', {
        templateUrl: 'partials/dashboards/dashboards-list-buttons.html',
        controller: DashboardsListButtonsController,
        controllerAs: 'vm',
        bindings: {
            dashboard: '<',
            onDelete: '&',
            onDuplicate: '&',
        },
    });

    DashboardsListButtonsController.$inject = ['$uibModal', 'api', 'base', 'gettextCatalog', '$rootScope', 'userService'];

    function DashboardsListButtonsController ($uibModal, api, base, gettextCatalog, $rootScope, userService) {
        const vm = this;

        vm.openDeleteModal = openDeleteModal;
        vm.openDuplicateModal = openDuplicateModal;
        vm.publish = publish;
        vm.unpublish = unpublish;
        vm.share = share;
        vm.unshare = unshare;
        vm.getCopyLink = getCopyLink;
        vm.isAdmin = false;
        vm.creationAuthorised = false;

        activate();

        function activate () {
            userService.getCurrentUser().then(user => {
                vm.isAdmin = user.isAdmin();
                vm.creationAuthorised = user.dashboardsCreate;
            });
        }

        function openDeleteModal () {
            const modal = $uibModal.open({
                component: 'appDeleteModal',
                resolve: {
                    title: () => gettextCatalog.getString('Delete {{name}} ?', { name: vm.dashboard.dashboardName }),
                    delete: () => function () {
                        return api.deleteDashboard(vm.dashboard._id).then(function () { $rootScope.$broadcast('counts-changes'); });
                        ;
                    },
                },

            });

            modal.result.then(function () {
                vm.onDelete();
            });
        }

        function openDuplicateModal () {
            const modal = $uibModal.open({
                component: 'appDuplicateModal',
                resolve: {
                    name: () => vm.dashboard.dashboardName,
                    duplicate: () => function (newName) {
                        const params = {
                            dashboard: { _id: vm.dashboard._id },
                            newName: newName,
                        };

                        return duplicateDashboard(params);
                    },
                },
            });
            modal.result.then(function () {
                vm.onDuplicate();
            });

            return modal;
        }

        function publish () {
            return api.publishDashboard(vm.dashboard._id).then(() => {
                vm.dashboard.isPublic = true;
            });
        }

        function unpublish () {
            return api.unpublishDashboard(vm.dashboard._id).then(() => {
                vm.dashboard.isPublic = false;
            });
        }

        function share (folderID) {
            return api.shareDashboard(vm.dashboard._id, folderID).then(() => {
                vm.dashboard.isShared = true;
                vm.dashboard.parentFolder = folderID;
            });
        }

        function unshare (e) {
            return api.unshareDashboard(vm.dashboard._id).then(() => {
                vm.dashboard.parentFolder = undefined;
                vm.dashboard.isShared = false;
            });
        }

        function getCopyLink () {
            const protocol = window.location.protocol;
            const host = window.location.host;
            return protocol + '//' + host + base + '/dashboards/view/' + vm.dashboard._id;
        }

        function duplicateDashboard (duplicateOptions) {
            return api.getDashboard(duplicateOptions.dashboard._id).then(function (dashboard) {
                delete dashboard._id;
                delete dashboard.createdOn;
                dashboard.dashboardName = duplicateOptions.newName;

                return api.createDashboard(dashboard).then(function () { $rootScope.$broadcast('counts-changes'); });
            });
        }
    }
})();
