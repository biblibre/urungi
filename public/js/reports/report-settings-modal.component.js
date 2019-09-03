(function () {
    'use strict';

    angular.module('app.reports').component('appReportSettingsModal', {
        templateUrl: 'partials/reports/report-settings-modal.component.html',
        controller: ReportSettingsModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    ReportSettingsModalController.$inject = [];

    function ReportSettingsModalController () {
        const vm = this;

        vm.aggregationsOptions = [];
        vm.report = {};
        vm.settings = {};
        vm.$onInit = $onInit;

        function $onInit () {
            const report = vm.resolve.report;

            vm.report = report;

            vm.settings.reportType = report.reportType;
            vm.settings.legendPosition = report.properties.legendPosition;
            vm.settings.height = report.properties.height;
        }
    }
})();
