(function () {
    'use strict';

    angular.module('app.dashboards').component('appDashboardsListItem', {
        templateUrl: 'partials/dashboards/dashboards-list-item.html',
        controller: DashboardsListItemController,
        controllerAs: 'vm',
        bindings: {
            dashboard: '<',
            onDelete: '&',
            onDuplicate: '&',
        },
    });

    DashboardsListItemController.$inject = ['$uibModal', 'api', 'dashboardv2Model', 'gettextCatalog'];

    function DashboardsListItemController ($uibModal, api, dashboardv2Model, gettextCatalog) {
        const vm = this;

        vm.openDeleteModal = openDeleteModal;
        vm.openDuplicateModal = openDuplicateModal;
        vm.publish = publish;
        vm.unpublish = unpublish;
        vm.share = share;
        vm.unshare = unshare;
        vm.getCopyLink = getCopyLink;

        function openDeleteModal () {
            const modal = $uibModal.open({
                component: 'appDeleteModal',
                resolve: {
                    title: () => gettextCatalog.getString('Delete {{name}} ?', { name: vm.dashboard.dashboardName }),
                    delete: () => function () {
                        return api.deleteDashboard(vm.dashboard._id);
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

                        return dashboardv2Model.duplicateDashboard(params);
                    },
                },
            });
            modal.result.then(function () {
                vm.onDuplicate();
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
            return protocol + '//' + host + '/#/dashboards/view/' + vm.dashboard._id;
        }
    }
})();
