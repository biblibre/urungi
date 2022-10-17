(function () {
    'use strict';

    angular.module('app.dashboard-edit').component('appReportsImportModal', {
        templateUrl: 'partials/dashboard-edit/dashboard-edit.reports-import-modal.component.html',
        controller: ReportsImportModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    function ReportsImportModalController () {
    }
})();
