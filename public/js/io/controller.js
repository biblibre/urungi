app.controller('ioCtrl', function ($scope, $rootScope, connection, $routeParams, ioModel, FileSaver, Upload) {
    $scope.layers = [];
    $scope.reports = [];
    $scope.dashboards = [];

    $scope.exportName = 'export';

    $scope.state = 1;

    $scope.matchAllDatasourcesMessage = false;

    $scope.initExport = async function () {
        $scope.layers = await ioModel.getLayers();
        $scope.reports = await ioModel.getReports();
        $scope.dashboards = await ioModel.getDashboards();
        $scope.$digest();
    };

    $scope.initImport = async function () {
        $scope.importFile = undefined;
        $scope.state = 1;
        $scope.fileReader = new FileReader();
    };

    $scope.downloadExport = function () {
        const getCheckedIds = function (items) {
            return items.filter(i => i.checked).map(i => i._id);
        };

        const layerIDs = getCheckedIds($scope.layers);
        const reportIDs = getCheckedIds($scope.reports);
        const dashboardIDs = getCheckedIds($scope.dashboards);

        ioModel.makeExportBundle(dashboardIDs, reportIDs, layerIDs)
            .then(bundle => {
                const blob = new Blob([JSON.stringify(bundle, null, 2)]);
                FileSaver.saveAs(blob, $scope.exportName + '.json');
            });
    };

    $scope.upload = function (file) {
        $scope.fileReader.readAsText(file);
        $scope.fileReader.onload = function () {
            try {
                $scope.importFile = JSON.parse($scope.fileReader.result);
                if (!($scope.importFile.layers && $scope.importFile.reports &&
                    $scope.importFile.datasources && $scope.importFile.dashboards)) {
                    var error = Object();
                    error['msg'] = 'missing fields';
                    throw error;
                }
            } catch (err) {
                console.log('invalid file format');
                console.log(err);
                $scope.importFile = undefined;
            }
            $scope.$digest();
        };
    };

    function autoDetect (dts) {
        for (const localDts of $scope.localDataSources) {
            if (localDts.name === dts.name) {
                return localDts;
            }
        }
    }

    $scope.startImport = async function () {
        $scope.datasourceMatch = {};
        $scope.localDataSources = await ioModel.getDataSources();
        for (const dts of $scope.importFile.datasources) {
            $scope.datasourceMatch[dts._id] = autoDetect(dts);
        }

        $scope.state = 2;
        $scope.$digest();
    };

    $scope.confirmImport = function () {
        var datasourceRef = {};
        for (const dtsID in $scope.datasourceMatch) {
            if (!$scope.datasourceMatch[dtsID]) {
                $scope.matchAllDatasourcesMessage = true;
                return;
            }
            datasourceRef[dtsID] = $scope.datasourceMatch[dtsID]._id;
        }
        ioModel.importBundle($scope.importFile, datasourceRef).then(function (result) {
            $scope.state = 3;
            $scope.created = result;
            $scope.$digest();
        },
        function (error) {
            $scope.state = 4;
            $scope.created = false;
            $scope.creationError = error;
            $scope.$digest();
        });
    };

    $scope.cancelImport = function () {
        $scope.state = 1;
    };

    $scope.logError = function () {
        console.log($scope.creationError);
    };
});
