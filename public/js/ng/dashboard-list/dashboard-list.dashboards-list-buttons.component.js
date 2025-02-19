(function () {
    'use strict';

    angular.module('app.dashboard-list').component('appDashboardsListButtons', {
        templateUrl: 'partials/dashboard-list/dashboard-list.dashboards-list-buttons.component.html',
        controller: DashboardsListButtonsController,
        controllerAs: 'vm',
        bindings: {
            dashboard: '<',
            onDelete: '&',
            onDuplicate: '&',
        },
    });

    DashboardsListButtonsController.$inject = ['$uibModal', 'api', 'base', 'i18n', 'expand', 'userService'];

    function DashboardsListButtonsController ($uibModal, api, base, i18n, expand, userService) {
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
            import('../../modal/delete-modal.js').then(({ default: DeleteModal }) => {
                const modal = new DeleteModal({
                    title: expand(i18n.gettext('Delete {{name}} ?'), { name: vm.dashboard.dashboardName }),
                    delete: function () {
                        return api.deleteDashboard(vm.dashboard._id);
                    },
                });
                modal.open().then(() => vm.onDelete(), () => {});
            });
        }

        function openDuplicateModal () {
            import('../../modal/duplicate-modal.js').then(({ default: DuplicateModal }) => {
                const modal = new DuplicateModal({
                    name: vm.dashboard.dashboardName,
                    duplicate: function (newName) {
                        const params = {
                            dashboard: { _id: vm.dashboard._id },
                            newName,
                        };

                        return duplicateDashboard(params);
                    },
                });
                modal.open().then(() => vm.onDuplicate(), () => {});
            });
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

                return api.createDashboard(dashboard);
            });
        }
    }
})();
