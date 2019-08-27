(function () {
    'use strict';

    angular.module('app.reports').component('appReportColumnSettingsModal', {
        templateUrl: 'partials/reports/report-column-settings-modal.component.html',
        controller: ReportColumnSettingsModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    ReportColumnSettingsModalController.$inject = ['reportsService'];

    function ReportColumnSettingsModalController (reportsService) {
        const vm = this;

        vm.aggregationsOptions = [];
        vm.column = {};
        vm.report = {};
        vm.settings = {};
        vm.$onInit = $onInit;

        function $onInit () {
            const column = vm.resolve.column;
            const report = vm.resolve.report;

            vm.column = column;
            vm.report = report;

            vm.settings.aggregation = column.aggregation;
            vm.settings.doNotStack = column.doNotStack || false;
            vm.settings.type = column.type || 'bar';

            const aggregations = [];

            if (column.elementType === 'number') {
                aggregations.push('sum', 'avg', 'min', 'max');
            }

            aggregations.push('count', 'countDistinct');

            vm.aggregationsOptions = aggregations.map(agg => ({
                name: reportsService.getAggregationDescription(agg),
                value: agg,
            }));
        }
    }
})();
