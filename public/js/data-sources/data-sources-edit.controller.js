(function () {
    'use strict';

    angular.module('app.data-sources').controller('DataSourcesEditController', DataSourcesEditController);

    DataSourcesEditController.$inject = ['connection', '$routeParams', '$http', 'gettextCatalog'];

    function DataSourcesEditController (connection, $routeParams, $http, gettextCatalog) {
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
                connection.get('/api/data-sources/find-one', { id: $routeParams.dataSourceID }).then(function (data) {
                    vm._dataSource = data.item;
                });
            }
        }

        function save () {
            if (vm.mode === 'add') {
                var data = vm._dataSource;
                connection.post('/api/data-sources/create', data).then(function (data) {
                    window.history.back();
                });
            } else {
                connection.post('/api/data-sources/update/' + vm._dataSource._id, vm._dataSource).then(function (result) {
                    if (result.result === 1) {
                        window.history.back();
                    }
                });
            }
        };

        function doTestConnection () {
            vm.testConnection = {};
            var data = {};
            data.type = vm._dataSource.type;
            data.host = vm._dataSource.connection.host;
            data.port = vm._dataSource.connection.port;
            data.database = vm._dataSource.connection.database;
            data.userName = vm._dataSource.connection.userName;
            data.password = vm._dataSource.connection.password;

            if (vm._dataSource.connection.file) data.file = vm._dataSource.connection.file;

            connection.post('/api/data-sources/testConnection', data).then(function (result) {
                if (result.result === 1) {
                    vm.testConnection = { result: 1, message: gettextCatalog.getString('Successful database connection.') };
                } else {
                    vm.testConnection = { result: 0, message: gettextCatalog.getString('Database connection failed.'), errorMessage: result.msg };
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
