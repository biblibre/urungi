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

    ReportsImportModalController.$inject = ['api'];

    function ReportsImportModalController (api) {
        const vm = this;

        vm.reports = [];
        vm.columns = [];
        vm.lastRefreshParams = {};
        vm.$onInit = $onInit;
        vm.refresh = refresh;

        function $onInit () {
            vm.columns = getColumns();
        }

        function refresh (params) {
            params = params || vm.lastRefreshParams;
            vm.lastRefreshParams = params;

            params.fields = ['reportName', 'isPublic'];

            return api.getReports(params).then(result => {
                vm.reports = result.items;

                return { page: result.page, pages: result.pages };
            });
        }

        function getColumns () {
            return [
                {
                    name: 'reportName',
                    label: 'Name',
                    width: 12,
                },
            ];
        }
    }
})();
