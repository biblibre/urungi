(function () {
    'use strict';

    angular.module('app.datasource-edit')
        .controller('DatasourceEditController', DatasourceEditController)
        .component('appDatasourceEdit', {
            templateUrl: 'partials/datasource-edit/datasource-edit.component.html',
            controller: 'DatasourceEditController',
            controllerAs: 'vm',
            bindings: {
                datasourceId: '@',
            },
        });

    DatasourceEditController.$inject = ['$window', 'i18n', 'api'];

    function DatasourceEditController ($window, i18n, api) {
        const vm = this;

        vm.$onInit = $onInit;
        vm._dataSource = null;
        vm.doTestConnection = doTestConnection;
        vm.enableTestConnection = enableTestConnection;
        vm.mode = 'edit';
        vm.save = save;
        vm.testConnection = {};

        function $onInit () {
            if (vm.datasourceId === 'new') {
                vm._dataSource = {};
                vm._dataSource.connection = {};
                vm._dataSource.status = 1;
                vm._dataSource.type = 'MySQL';

                vm.mode = 'add';
            } else {
                api.getDatasource(vm.datasourceId).then(function (data) {
                    vm._dataSource = data;
                });
            }
        }

        function save () {
            if (vm.mode === 'add') {
                api.createDatasource(vm._dataSource).then(data => {
                    $window.location.href = 'data-sources';
                });
            } else {
                api.updateDatasource(vm._dataSource._id, vm._dataSource).then(result => {
                    $window.location.href = 'data-sources';
                });
            }
        };

        function doTestConnection () {
            return api.testConnection(vm._dataSource).then(result => {
                if (result.ok) {
                    vm.testConnection = { result: 1, message: i18n.gettext('Successful database connection.') };
                } else {
                    vm.testConnection = { result: 0, message: i18n.gettext('Database connection failed.') + ' ' + result.error };
                }
            });
        };

        function enableTestConnection () {
            if (!vm._dataSource) {
                return false;
            }

            if (vm._dataSource.connection.host && vm._dataSource.connection.database) {
                return true;
            }

            return false;
        };
    }
})();
