(function () {
    'use strict';

    angular.module('app.share').component('appSharePopover', {
        templateUrl: 'partials/share/share.share-popover.component.html',
        controller: SharePopoverController,
        controllerAs: 'vm',
        bindings: {
            item: '<',
            publish: '<',
            unpublish: '<',
            share: '<',
            unshare: '<',
            getCopyLink: '<',
        },
    });

    SharePopoverController.$inject = ['$uibModal', 'i18n', 'api'];

    function SharePopoverController ($uibModal, i18n, api) {
        const vm = this;

        vm.openShareModal = openShareModal;
        vm.onCopySuccess = onCopySuccess;

        function openShareModal () {
            const modal = $uibModal.open({
                component: 'appShareModal',
                resolve: {
                    item: () => vm.item,
                    userObjects: api.getUserObjects,
                },
            });
            modal.result.then(function (folderID) {
                vm.share(folderID);
            });
        }

        function onCopySuccess (e) {
            const tooltipTitle = i18n.gettext('Copied');
            $(e.trigger).tooltip({ title: tooltipTitle, trigger: 'manual' })
                .on('shown.bs.tooltip', function () {
                    setTimeout(() => {
                        $(this).tooltip('destroy');
                    }, 1000);
                })
                .tooltip('show');
        }
    }
})();
