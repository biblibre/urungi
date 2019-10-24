require('../../../public/js/core/core.module.js');
require('../../../public/js/core/api.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/io/io.module.js');
require('../../../public/js/io/export.controller.js');

describe('ExportController', function () {
    let lastBlob;

    beforeEach(angular.mock.module('app.io'));
    beforeEach(angular.mock.module(function ($provide) {
        $provide.service('FileSaver', function () {
            return {
                saveAs: saveAs,
            };

            function saveAs (blob, filename) {
                lastBlob = blob;
            }
        });
    }));
    window.Blob = function (array, options) {
        return { array, options };
    };

    let $controller, $httpBackend;
    let vm;

    beforeEach(inject(function (_$controller_, _$httpBackend_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('downloadExport', function () {
        it('should call FileSaver.saveAs', () => {
            const $scope = {};
            vm = $controller('ExportController', { $scope: $scope });

            $httpBackend.expect('GET', '/api/layers/find-all')
                .respond(apiLayersFindAllResponse());
            $httpBackend.expect('GET', '/api/reports/find-all')
                .respond(apiReportsFindAllResponse());
            $httpBackend.expect('GET', '/api/dashboards/find-all')
                .respond(apiDashboardsFindAllResponse());

            $httpBackend.flush();

            vm.layers.forEach(l => { l.checked = true; });
            vm.reports.forEach(r => { r.checked = true; });
            vm.dashboards.forEach(d => { d.checked = true; });

            $httpBackend.expect('GET', '/api/reports/find-one?id=fakereportid')
                .respond(apiReportsFindOneResponse());
            $httpBackend.expect('GET', '/api/dashboards/find-one?id=fakedashboardid')
                .respond(apiDashboardsFindOneResponse());
            $httpBackend.expect('GET', '/api/layers/find-one?id=fakelayerid')
                .respond(apiLayersFindOneResponse());
            $httpBackend.expect('GET', '/api/data-sources/find-one?id=fakedatasourceid')
                .respond(apiDatasourcesFindOneResponse());

            const p = vm.downloadExport().then(() => {
                const result = JSON.parse(lastBlob.array[0]);
                return result;
            });

            setTimeout($httpBackend.flush, 0);

            return expect(p).resolves.toEqual({
                reports: [getReport()],
                dashboards: [getDashboard()],
                layers: [getLayer()],
                datasources: [getDatasource()],
            });
        });

        function getLayer () {
            return {
                _id: 'fakelayerid',
                name: 'FakeLayer',
                status: 'active',
                datasourceID: 'fakedatasourceid',
            };
        }

        function apiLayersFindAllResponse () {
            return {
                result: 1,
                page: 1,
                pages: 1,
                items: [getLayer()],
            };
        }

        function apiLayersFindOneResponse () {
            return {
                result: 1,
                item: getLayer(),
            };
        }

        function getReport () {
            return {
                _id: 'fakereportid',
                reportName: 'FakeReport',
                selectedLayerID: 'fakelayerid',
            };
        }

        function apiReportsFindAllResponse () {
            return {
                result: 1,
                page: 1,
                pages: 1,
                items: [getReport()],
            };
        }

        function apiReportsFindOneResponse () {
            return {
                result: 1,
                item: getReport(),
            };
        }

        function getDashboard () {
            return {
                _id: 'fakedashboardid',
                reportName: 'FakeDashboard',
                reports: [],
            };
        }

        function apiDashboardsFindAllResponse () {
            return {
                result: 1,
                page: 1,
                pages: 1,
                items: [getDashboard()],
            };
        }

        function apiDashboardsFindOneResponse () {
            return {
                result: 1,
                item: getDashboard(),
            };
        }

        function getDatasource () {
            return {
                _id: 'fakedatasourceid',
                connection: {
                    host: 'localhost',
                },
                type: 'MySQL',
                name: 'Database',
            };
        }

        function apiDatasourcesFindOneResponse () {
            return {
                result: 1,
                item: getDatasource(),
            };
        }
    });
});
