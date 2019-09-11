(function () {
    'use strict';

    angular.module('app.reports').controller('ReportsViewController', ReportsViewController);

    ReportsViewController.$inject = ['$scope', '$timeout', 'api', 'xlsxService', 'userService', 'report'];

    function ReportsViewController ($scope, $timeout, api, xlsxService, userService, report) {
        const vm = this;
        vm.report = report;
        vm.prompts = {};
        vm.getPrompts = getPrompts;
        vm.repaintWithPrompts = repaintWithPrompts;
        vm.saveAsXLSX = saveAsXLSX;
        vm.isAdmin = false;

        activate();

        function activate () {
            userService.getCurrentUser().then(user => {
                vm.isAdmin = user.isAdmin();
            });

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
                filters: filterCriteria
            });
        }

        function saveAsXLSX () {
            api.getReportData(vm.report).then(function (res) {
                xlsxService.saveReportAsXLSX(vm.report, res.data);
            });
        }
    }
})();
