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

    ReportColumnSettingsModalController.$inject = ['reportsService', 'api'];

    function ReportColumnSettingsModalController (reportsService, api) {
        const vm = this;

        vm.$onInit = $onInit;
        vm.aggregationsOptions = [];
        vm.canCalculateTotal = canCalculateTotal;
        vm.column = {};
        vm.isAggregatable = isAggregatable;
        vm.report = {};
        vm.settings = {};
        vm.categories = [];

        function $onInit () {
            const column = vm.resolve.column;
            const report = vm.resolve.report;

            vm.column = column;
            vm.report = report;

            vm.settings.aggregation = column.aggregation;
            vm.settings.doNotStack = column.doNotStack || false;
            vm.settings.label = column.label || '';
            vm.settings.type = column.type || 'bar';
            vm.settings.format = column.format || '';
            vm.settings.calculateTotal = column.calculateTotal || false;

            api.getReportFilterValues({ ...column, layerID: vm.report.selectedLayerID }).then((data) => {
                vm.categories = data.data.map((e) => e.f);
            });
            vm.settings.icon = column.icon || {};

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

        function canCalculateTotal () {
            if (['grid', 'vertical-grid'].includes(vm.report.reportType)) {
                if (vm.column.elementType === 'number' || ['count', 'countDistinct'].includes(vm.settings.aggregation)) {
                    return true;
                }
            }

            return false;
        }

        function isAggregatable () {
            const properties = vm.report.properties;
            const aggregatableCols = properties.columns.concat(properties.ykeys);

            return aggregatableCols.includes(vm.column);
        }
    }
})();
