(function () {
    'use strict';

    angular.module('app.data-sources').controller('DataSourcesEditController', DataSourcesEditController);

    DataSourcesEditController.$inject = ['$routeParams', '$location', 'gettextCatalog', 'Noty', 'api', '$rootScope', 'toastr'];

    function DataSourcesEditController ($routeParams, $location, gettextCatalog, Noty, api, $rootScope, toastr) {
        const vm = this;

        vm._dataSource = null;
        vm.doTestConnection = doTestConnection;
        vm.enableTestConnection = enableTestConnection;
        vm.mode = 'edit';
        vm.save = save;
        vm.testConnection = {};

        activate();

        function activate () {
            if ($routeParams.dataSourceID === 'new') {
                vm._dataSource = {};
                vm._dataSource.connection = {};
                vm._dataSource.status = 1;
                vm._dataSource.type = 'MySQL';

                vm.mode = 'add';
            } else {
                api.getDatasource($routeParams.dataSourceID).then(function (data) {
                    vm._dataSource = data;
                });
            }
        }

        function save () {
            if (vm.mode === 'add') {
                api.createDatasource(vm._dataSource).then(data => {
                    // toastr.success(gettextCatalog.getString('Datasource created successfully'));
                    new Noty({ text: gettextCatalog.getString('Datasource updated successfully'), type: 'success' }).show();
                    $location.url('/data-sources');
                }).then(function () { $rootScope.$broadcast('counts-changes'); });
            } else {
                api.updateDatasource(vm._dataSource._id, vm._dataSource).then(result => {
                    new Noty({ text: gettextCatalog.getString('Datasource updated successfully'), type: 'success' }).show();
                    $location.url('/data-sources');
                });
            }
        };

        function doTestConnection () {
            return api.testConnection(vm._dataSource).then(result => {
                if (result.ok) {
                    vm.testConnection = { result: 1, message: gettextCatalog.getString('Successful database connection.') };
                } else {
                    vm.testConnection = { result: 0, message: gettextCatalog.getString('Database connection failed.') + ' ' + result.error };
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
