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

    SharePopoverController.$inject = ['i18n', 'api', 'userService'];

    function SharePopoverController (i18n, api, userService) {
        const vm = this;

        vm.openShareModal = openShareModal;
        vm.onCopySuccess = onCopySuccess;

        function openShareModal () {
            import('../../modal/share-modal.js').then(async function ({ default: ShareModal }) {
                const user = await userService.getCurrentUser();
                const modal = new ShareModal({
                    item: vm.item,
                    userObjects: await api.getUserObjects(),
                    isAdmin: user.isAdmin(),
                });
                modal.open().then(json => {
                    const { folderId } = JSON.parse(json);
                    if (folderId) {
                        vm.share(folderId);
                    } else {
                        vm.unshare();
                    }
                }, () => {});
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
