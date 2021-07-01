(function () {
    'use strict';

    angular.module('app.reports').component('appReportsListButtons', {
        templateUrl: 'partials/reports/reports-list-buttons.html',
        controller: ReportsListButtonsController,
        controllerAs: 'vm',
        bindings: {
            report: '<',
            onDelete: '&',
            onDuplicate: '&',
        },
    });

    ReportsListButtonsController.$inject = ['$uibModal', 'api', 'base', 'reportModel', 'gettextCatalog', '$rootScope'];

    function ReportsListButtonsController ($uibModal, api, base, reportModel, gettextCatalog, $rootScope) {
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
                    title: () => gettextCatalog.getString('Delete {{name}} ?', { name: vm.report.reportName }),
                    delete: () => function () {
                        return api.deleteReport(vm.report._id).then(function () { $rootScope.$broadcast('counts-changes'); }); ;
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
                    name: () => vm.report.reportName,
                    duplicate: () => function (newName) {
                        const params = {
                            report: { _id: vm.report._id },
                            newName: newName,
                        };

                        return reportModel.duplicateReport(params);
                    },
                },
            });
            modal.result.then(function () {
                vm.onDuplicate();
            });
        }

        function publish () {
            return api.publishReport(vm.report._id).then(() => {
                vm.report.isPublic = true;
            });
        }

        function unpublish () {
            return api.unpublishReport(vm.report._id).then(() => {
                vm.report.isPublic = false;
            });
        }

        function share (folderID) {
            return api.shareReport(vm.report._id, folderID).then(() => {
                vm.report.isShared = true;
                vm.report.parentFolder = folderID;
            });
        }

        function unshare () {
            return api.unshareReport(vm.report._id).then(() => {
                vm.report.parentFolder = undefined;
                vm.report.isShared = false;
            });
        }

        function getCopyLink () {
            const protocol = window.location.protocol;
            const host = window.location.host;
            return protocol + '//' + host + base + '/reports/view/' + vm.report._id;
        }
    }
})();
