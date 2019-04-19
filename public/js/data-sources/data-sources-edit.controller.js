(function () {
    'use strict';

    angular.module('app.data-sources').controller('DataSourcesEditController', DataSourcesEditController);

    DataSourcesEditController.$inject = ['connection', '$routeParams', '$http'];

    function DataSourcesEditController (connection, $routeParams, $http) {
        const vm = this;

        vm._dataSource = null;
        vm.doTestConnection = doTestConnection;
        vm.enableTestConnection = enableTestConnection;
        vm.mode = 'edit';
        vm.save = save;
        vm.testConnection = {};
        vm.testingConnection = false;
        vm.upload = upload;

        activate();

        function activate () {
            if ($routeParams.dataSourceID === 'new') {
                vm._dataSource = {};
                vm._dataSource.connection = {};
                vm._dataSource.packetSize = 500;
                vm._dataSource.status = 1;
                vm._dataSource.type = 'MySQL';

                vm.mode = 'add';
            } else {
                connection.get('/api/data-sources/find-one', {id: $routeParams.dataSourceID}).then(function (data) {
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
            vm.testingConnection = true;
            data.type = vm._dataSource.type;
            data.host = vm._dataSource.connection.host;
            data.port = vm._dataSource.connection.port;
            data.database = vm._dataSource.connection.database;
            data.userName = vm._dataSource.connection.userName;
            data.password = vm._dataSource.connection.password;

            if (vm._dataSource.connection.file) data.file = vm._dataSource.connection.file;

            connection.post('/api/data-sources/testConnection', data).then(function (result) {
                console.log(result);
                if (result.result === 1) {
                    vm.testConnection = {result: 1, message: 'Successful database connection.'};
                    vm.testingConnection = false;
                } else {
                    vm.testConnection = {result: 0, message: 'Database connection failed.', errorMessage: result.msg};
                    vm.testingConnection = false;
                }
            });
        };

        function enableTestConnection () {
            if (!vm._dataSource) {
                return false;
            }

            if (vm._dataSource.type !== 'BIGQUERY' && vm._dataSource.connection.host && vm._dataSource.connection.database) {
                return true;
            }

            if (vm._dataSource.type === 'BIGQUERY' && vm._dataSource.connection.database && vm._dataSource.connection.file && vm.fileUploadSuccess) {
                return true;
            }

            return false;
        };

        function upload (file) {
            if (file) {
                vm._dataSource.connection.file = file.name;

                var fd = new FormData();

                fd.append('file', file);

                $http.post('/api/data-sources/upload-config-file', fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                })
                    .success(angular.bind(this, function (data, status, headers, config) {
                        if (data.result === 1) {
                            vm.fileUploadSuccess = true;
                            vm.fileUploadMessage = 'File uploaded successfully';
                        } else {
                            vm.fileUploadSuccess = false;
                            vm.fileUploadMessage = 'File upload failed [' + data.msg + ']';
                        }
                    }))
                    .error(function (data, status) {
                        vm.fileUploadSuccess = false;
                        vm.fileUploadMessage = 'File upload failed [' + data.msg + ']';
                    });
            }
        };
    }
})();
