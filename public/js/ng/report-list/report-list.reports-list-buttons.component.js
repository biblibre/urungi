(function () {
    'use strict';

    angular.module('app.report-list').component('appReportsListButtons', {
        templateUrl: 'partials/report-list/report-list.reports-list-buttons.html',
        controller: ReportsListButtonsController,
        controllerAs: 'vm',
        bindings: {
            report: '<',
            onDelete: '&',
            onDuplicate: '&',
        },
    });

    ReportsListButtonsController.$inject = ['api', 'base', 'i18n', 'expand', 'userService'];

    function ReportsListButtonsController (api, base, i18n, expand, userService) {
        const vm = this;

        vm.openDeleteModal = openDeleteModal;
        vm.openDuplicateModal = openDuplicateModal;
        vm.publish = publish;
        vm.unpublish = unpublish;
        vm.share = share;
        vm.unshare = unshare;
        vm.getCopyLink = getCopyLink;

        activate();

        function activate () {
            userService.getCurrentUser().then(user => {
                vm.creationAuthorised = user.reportsCreate;
            });
        }

        function openDeleteModal () {
            import('../../modal/delete-modal.js').then(({ default: DeleteModal }) => {
                const modal = new DeleteModal({
                    title: expand(i18n.gettext('Delete {{name}} ?'), { name: vm.report.reportName }),
                    delete: function () {
                        return api.deleteReport(vm.report._id);
                    },
                });
                modal.open().then(() => vm.onDelete(), () => {});
            });
        }

        function openDuplicateModal () {
            import('../../modal/duplicate-modal.js').then(({ default: DuplicateModal }) => {
                const modal = new DuplicateModal({
                    name: vm.report.reportName,
                    duplicate: function (newName) {
                        return api.duplicateReport({ reportId: vm.report._id, newName });
                    },
                });
                modal.open().then(() => { vm.onDuplicate() }, () => {});
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
