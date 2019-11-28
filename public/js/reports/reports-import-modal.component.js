(function () {
    'use strict';

    angular.module('app.reports').component('appReportsImportModal', {
        templateUrl: 'partials/reports/reports-import-modal.html',
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
