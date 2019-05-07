(function () {
    'use strict';

    angular.module('app.reports').controller('ReportsViewController', ReportsViewController);

    ReportsViewController.$inject = ['$scope', '$timeout', 'reportsService', 'xlsxService', 'report'];

    function ReportsViewController ($scope, $timeout, reportsService, xlsxService, report) {
        const vm = this;
        vm.report = report;
        vm.prompts = {};
        vm.getPrompts = getPrompts;
        vm.repaintWithPrompts = repaintWithPrompts;
        vm.getQueryForFilter = getQueryForFilter;
        vm.saveAsXLSX = saveAsXLSX;

        activate();

        function activate () {
            vm.prompts = initPrompts();

            $timeout(function () {
                $scope.$broadcast('repaint', { fetchData: true });
            }, 0);
        }

        function initPrompts () {
            const prompts = {};
            for (const filter of vm.report.properties.filters) {
                if (filter.filterPrompt) {
                    const p = {};
                    for (const key in filter) {
                        p[key] = filter[key];
                    }
                    p.criterion = {};
                    prompts[p.id + p.filterType] = p;
                }
            }

            return prompts;
        }

        function getPrompts () {
            return Object.values(vm.prompts);
        }

        function repaintWithPrompts () {
            const filterCriteria = {};
            for (const i in vm.prompts) {
                filterCriteria[i] = vm.prompts[i].criterion;
            }

            $scope.$broadcast('repaint', {
                fetchData: true,
                filterCriteria: filterCriteria
            });
        }

        function getQueryForFilter (filter) {
            return reportsService.getQueryForFilter(vm.report, filter);
        }

        function saveAsXLSX () {
            xlsxService.saveReportAsXLSX(vm.report);
        }
    }
})();
