(function () {
    'use strict';

    angular.module('app.report-list').component('appReportsTable', {
        bindings: {
            hideButtons: '<',
            onSelect: '&?',
        },
        controller: ReportsTableController,
        controllerAs: 'vm',
        templateUrl: 'partials/report-list/report-list.reports-table.component.html',
    });

    ReportsTableController.$inject = ['api'];

    function ReportsTableController (api) {
        const vm = this;

        vm.currentPage = 1;
        vm.filters = {};
        vm.goToPage = goToPage;
        vm.onFilter = onFilter;
        vm.onSort = onSort;
        vm.page = 1;
        vm.pages = 1;
        vm.refresh = refresh;
        vm.reports = [];
        vm.select = select;
        vm.sortDir = {};

        activate();

        function activate () {
            vm.sortDir.reportName = 1;
            refresh();
        }

        function goToPage (page) {
            vm.page = page;
            refresh();
        }

        function onFilter (name, value) {
            vm.filters[name] = value;
            vm.page = 1;
            refresh();
        }

        function onSort (name, dir) {
            for (const key in vm.sortDir) {
                vm.sortDir[key] = 0;
            }
            vm.sortDir[name] = dir;
            refresh();
        }

        function refresh () {
            const params = {};
            params.fields = ['reportName', 'isPublic', 'isShared', 'layerName', 'parentFolder', 'owner', 'author', 'createdOn'];
            params.filters = vm.filters;
            params.sort = Object.keys(vm.sortDir).find(k => vm.sortDir[k]);
            params.sortType = vm.sortDir[params.sort];
            params.page = vm.page;
            params.populate = 'layer';

            return api.getReports(params).then(result => {
                vm.reports = result.items;
                vm.currentPage = result.page;
                vm.pages = result.pages;
            });
        }

        function select (ev, report) {
            if (vm.onSelect) {
                ev.preventDefault();
                vm.onSelect({ $report: report });
            }
        }
    }
})();
