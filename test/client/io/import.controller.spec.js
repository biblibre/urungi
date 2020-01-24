require('../../../public/js/core/core.module.js');
require('../../../public/js/core/api.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/io/io.module.js');
require('../../../public/js/io/import.controller.js');

describe('ImportController', function () {
    beforeEach(angular.mock.module('app.io'));

    let $controller, $httpBackend;
    let vm;

    window.FileReader = function () {
        return {
            readAsText: readAsText,
        };

        // Call onload callback synchronously
        function readAsText (file) {
            this.result = file.bits[0];
            this.onload();
        }
    };
    window.File = function (bits, name, options) {
        return { bits, name, options };
    };

    beforeEach(inject(function (_$controller_, _$httpBackend_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('upload', function () {
        it('should check import file and import all objects', async function () {
            $httpBackend.expect('GET', '/api/datasources')
                .respond(apiDatasourcesFindAllResponse());

            const $scope = {};
            vm = $controller('ImportController', { $scope: $scope });

            $httpBackend.flush();

            expect(vm.checkError).toBeUndefined();
            expect(vm.checkingFile).toBe(false);
            expect(vm.checkProgressValue).toBe(0);
            expect(vm.checkProgressMax).toBe(100);
            expect(vm.datasourceMatch).toEqual({});
            expect(vm.importBundle).toBeUndefined();
            expect(vm.importProgressValue).toBe(0);
            expect(vm.importProgressMax).toBe(100);
            expect(vm.importStarted).toBe(false);
            expect(vm.localDatasources).toEqual([getDatasource()]);
            expect(vm.messages).toEqual([]);
            expect(vm.step).toBe(1);

            const fileContent = JSON.stringify({
                reports: [getReport()],
                dashboards: [getDashboard()],
                layers: [getLayer()],
                datasources: [getDatasource()],
            });
            const file = new File([fileContent], 'export.json');

            $httpBackend.expect('GET', '/api/layers/find-one?id=fakelayerid')
                .respond(apiLayersFindOneResponse());
            $httpBackend.expect('GET', '/api/reports/find-one?id=fakereportid')
                .respond(apiReportsFindOneResponse());
            $httpBackend.expect('GET', '/api/dashboards/find-one?id=fakedashboardid')
                .respond(apiDashboardsFindOneResponse());

            setTimeout($httpBackend.flush);
            await expect(vm.upload(file)).resolves.toBeUndefined();

            expect(vm.checkError).toBeUndefined();
            expect(vm.checkingFile).toBe(false);
            expect(vm.checkProgressValue).toBe(4);
            expect(vm.checkProgressMax).toBe(4);
            expect(vm.datasourceMatch).toEqual({
                fakedatasourceid: getDatasource(),
            });
            expect(vm.importBundle).toEqual({
                layers: [{ valid: true, errors: [], exists: true, doc: getLayer() }],
                reports: [{ valid: true, errors: [], exists: true, doc: getReport() }],
                dashboards: [{ valid: true, errors: [], exists: true, doc: getDashboard() }],
                datasources: [{ doc: getDatasource() }],
            });
            expect(vm.importProgressValue).toBe(0);
            expect(vm.importProgressMax).toBe(100);
            expect(vm.importStarted).toBe(false);
            expect(vm.localDatasources).toEqual([getDatasource()]);
            expect(vm.messages).toEqual([]);
            expect(vm.step).toBe(2);

            vm.importBundle.layers[0].overwrite = true;
            vm.importBundle.reports[0].overwrite = true;
            vm.importBundle.dashboards[0].overwrite = true;

            $httpBackend.expect('POST', '/api/layers/update/fakelayerid')
                .respond({ result: 1 });
            $httpBackend.expect('POST', '/api/reports/update/fakereportid')
                .respond({ result: 1 });
            $httpBackend.expect('POST', '/api/dashboards/update/fakedashboardid')
                .respond({ result: 1 });

            vm.form = { $valid: true };

            setTimeout($httpBackend.flush);

            await expect(vm.doImport()).resolves.toBeUndefined();

            expect(vm.checkError).toBeUndefined();
            expect(vm.checkingFile).toBe(false);
            expect(vm.checkProgressValue).toBe(4);
            expect(vm.checkProgressMax).toBe(4);
            expect(vm.datasourceMatch).toEqual({
                fakedatasourceid: getDatasource(),
            });
            expect(vm.importProgressValue).toBe(3);
            expect(vm.importProgressMax).toBe(3);
            expect(vm.importStarted).toBe(true);
            expect(vm.localDatasources).toEqual([getDatasource()]);
            expect(vm.messages).toEqual([
                { text: 'Layer updated successfully: FakeLayer', type: 'success' },
                { text: 'Report updated successfully: FakeReport', type: 'success' },
                { text: 'Dashboard updated successfully: FakeDashboard', type: 'success' },
                { text: 'Import completed', type: 'info' },
            ]);
            expect(vm.step).toBe(3);
        });

        function getLayer () {
            return {
                _id: 'fakelayerid',
                name: 'FakeLayer',
                status: 'active',
                datasourceID: 'fakedatasourceid',
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
                query: {
                    layerID: 'fakelayerid',
                },
                selectedLayerID: 'fakelayerid',
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
                dashboardName: 'FakeDashboard',
                reports: [],
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

        function apiDatasourcesFindAllResponse () {
            return {
                page: 1,
                pages: 1,
                items: [getDatasource()],
            };
        }
    });
});
