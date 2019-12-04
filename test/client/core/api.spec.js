require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/core/api.js');

describe('api', () => {
    beforeEach(angular.mock.module('app.core'));

    let $httpBackend;
    let api;

    beforeEach(inject((_api_, _$httpBackend_) => {
        $httpBackend = _$httpBackend_;
        api = _api_;
    }));

    afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('api.getVersion', function () {
        it('should call GET /api/version', function () {
            const url = '/api/version';
            const response = {
                data: {
                    version: '2.0.0',
                    gitVersion: '2.0.0-1-g0de3ed85-dirty',
                },
            };

            $httpBackend.expect('GET', url).respond(response);

            const p = api.getVersion();

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
        });
    });

    describe('api.getSharedSpace', function () {
        it('should call GET /api/shared-space', function () {
            const response = { items: [] };
            $httpBackend.expect('GET', '/api/shared-space').respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.getSharedSpace()).resolves.toEqual(response);
        });
    });

    describe('api.setSharedSpace', function () {
        it('should call PUT /api/shared-space', function () {
            const sharedSpace = [];
            const response = { items: sharedSpace };
            $httpBackend.expect('PUT', '/api/shared-space', sharedSpace).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.setSharedSpace(sharedSpace)).resolves.toEqual(response);
        });
    });

    describe('api.getReports', () => {
        it('should call /api/reports/find-all', () => {
            const url = '/api/reports/find-all' +
                '?fields=reportName&fields=owner' +
                '&filters=' + encodeURI('{"owner":"foo"}') +
                '&page=2&sort=owner&sortType=1';
            const response = {
                result: 1,
                items: [],
            };

            $httpBackend.expect('GET', url).respond(response);

            const params = {
                fields: ['reportName', 'owner'],
                filters: { owner: 'foo' },
                page: 2,
                sort: 'owner',
                sortType: 1,
            };
            const p = api.getReports(params);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
        });

        it('should throw if result is 0', () => {
            const url = '/api/reports/find-all';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('GET', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.getReports()).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/reports/find-all';

            $httpBackend.expect('GET', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.getReports()).rejects.toThrow('Forbidden');
        });
    });

    describe('api.getReport', () => {
        it('should call /api/reports/find-one', () => {
            const url = '/api/reports/find-one?id=42';
            const report = {
                reportName: 'foo',
            };
            const response = {
                result: 1,
                item: report,
            };

            $httpBackend.expect('GET', url).respond(response);

            const p = api.getReport(42);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(report);
        });

        it('should throw if result is 0', () => {
            const url = '/api/reports/find-one';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('GET', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.getReport()).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/reports/find-one';

            $httpBackend.expect('GET', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.getReport()).rejects.toThrow('Forbidden');
        });
    });

    describe('api.createReport', () => {
        it('should call /api/reports/create', () => {
            const url = '/api/reports/create';
            const report = {
                reportName: 'foo',
            };
            const response = {
                result: 1,
                item: report,
            };

            $httpBackend.expect('POST', url, report).respond(response);

            const p = api.createReport(report);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(report);
        });

        it('should throw if result is 0', () => {
            const url = '/api/reports/create';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('POST', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.createReport()).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/reports/create';

            $httpBackend.expect('POST', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.createReport()).rejects.toThrow('Forbidden');
        });
    });

    describe('api.updateReport', () => {
        it('should call /api/reports/update/:id', () => {
            const url = '/api/reports/update/42';
            const report = {
                _id: 42,
                reportName: 'foo',
            };
            const response = {
                result: 1,
                item: report,
            };

            $httpBackend.expect('POST', url, report).respond(response);

            const p = api.updateReport(report);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(report);
        });

        it('should throw if result is 0', () => {
            const url = '/api/reports/update/0';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('POST', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.updateReport({ _id: 0 })).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/reports/update/0';

            $httpBackend.expect('POST', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.updateReport({ _id: 0 })).rejects.toThrow('Forbidden');
        });
    });

    describe('api.getReportData', () => {
        it('should call POST /api/reports/data-query', () => {
            const url = '/api/reports/data-query';
            const report = {
                _id: 42,
                reportName: 'foo',
                properties: {},
            };
            const data = {
                report: report,
                limit: 500,
                filters: {
                    name: 'value',
                },
            };
            const response = {
                result: 1,
                data: ['foodata'],
            };

            $httpBackend.expect('POST', url, data).respond(response);

            const p = api.getReportData(report, { limit: 500, filters: { name: 'value' } });

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
        });

        it('should throw if request failed', () => {
            const url = '/api/reports/data-query';

            $httpBackend.expect('POST', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.getReportData({ properties: {} })).rejects.toThrow('Forbidden');
        });
    });

    describe('api.getReportFilterValues', () => {
        it('should call POST /api/reports/filter-values-query', () => {
            const url = '/api/reports/filter-values-query';
            const filter = {
                id: 'foo',
            };
            const data = {
                filter: filter,
            };
            const response = {
                result: 1,
                data: ['foodata'],
            };

            $httpBackend.expect('POST', url, data).respond(response);

            const p = api.getReportFilterValues(filter);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
        });

        it('should throw if request failed', () => {
            const url = '/api/reports/filter-values-query';

            $httpBackend.expect('POST', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.getReportFilterValues({})).rejects.toThrow('Forbidden');
        });
    });

    describe('api.getReportAsPDF', function () {
        it('should call /api/reports/:id/pdf', function () {
            const url = '/api/reports/foo/pdf';
            const response = {
                data: 'foodata',
            };

            $httpBackend.expect('POST', url).respond(response);

            const p = api.getReportAsPDF('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
        });
    });

    describe('api.getReportAsPNG', function () {
        it('should call /api/reports/:id/png', function () {
            const url = '/api/reports/foo/png';
            const response = {
                data: 'foodata',
            };

            $httpBackend.expect('POST', url).respond(response);

            const p = api.getReportAsPNG('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
        });
    });

    describe('api.isReportAsPDFAvailable', function () {
        it('should call OPTIONS /api/reports/:id/pdf and return false', function () {
            const url = '/api/reports/foo/pdf';

            $httpBackend.expect('OPTIONS', url).respond(501, '');

            const p = api.isReportAsPDFAvailable('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(false);
        });

        it('should call OPTIONS /api/reports/:id/pdf and return true', function () {
            const url = '/api/reports/foo/pdf';

            $httpBackend.expect('OPTIONS', url).respond(200, '');

            const p = api.isReportAsPDFAvailable('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(true);
        });
    });

    describe('api.isReportAsPNGAvailable', function () {
        it('should call OPTIONS /api/reports/:id/png and return false', function () {
            const url = '/api/reports/foo/png';

            $httpBackend.expect('OPTIONS', url).respond(501, '');

            const p = api.isReportAsPNGAvailable('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(false);
        });

        it('should call OPTIONS /api/reports/:id/png and return true', function () {
            const url = '/api/reports/foo/png';

            $httpBackend.expect('OPTIONS', url).respond(200, '');

            const p = api.isReportAsPNGAvailable('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(true);
        });
    });

    describe('api.getDashboards', () => {
        it('should call /api/dashboards/find-all', () => {
            const url = '/api/dashboards/find-all' +
                '?fields=dashboardName&fields=owner' +
                '&filters=' + encodeURI('{"owner":"foo"}') +
                '&page=2&sort=owner&sortType=1';
            const response = {
                result: 1,
                items: [],
            };

            $httpBackend.expect('GET', url).respond(response);

            const params = {
                fields: ['dashboardName', 'owner'],
                filters: { owner: 'foo' },
                page: 2,
                sort: 'owner',
                sortType: 1,
            };
            const p = api.getDashboards(params);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
        });

        it('should throw if result is 0', () => {
            const url = '/api/dashboards/find-all';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('GET', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.getDashboards()).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/dashboards/find-all';

            $httpBackend.expect('GET', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.getDashboards()).rejects.toThrow('Forbidden');
        });
    });

    describe('api.getDashboard', () => {
        it('should call /api/dashboards/find-one', () => {
            const url = '/api/dashboards/find-one?id=42';
            const dashboard = {
                dashboardName: 'foo',
            };
            const response = {
                result: 1,
                item: dashboard,
            };

            $httpBackend.expect('GET', url).respond(response);

            const p = api.getDashboard(42);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(dashboard);
        });

        it('should throw if result is 0', () => {
            const url = '/api/dashboards/find-one';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('GET', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.getDashboard()).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/dashboards/find-one';

            $httpBackend.expect('GET', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.getDashboard()).rejects.toThrow('Forbidden');
        });
    });

    describe('api.createDashboard', () => {
        it('should call /api/dashboards/create', () => {
            const url = '/api/dashboards/create';
            const dashboard = {
                dashboardName: 'foo',
            };
            const response = {
                result: 1,
                item: dashboard,
            };

            $httpBackend.expect('POST', url, dashboard).respond(response);

            const p = api.createDashboard(dashboard);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(dashboard);
        });

        it('should throw if result is 0', () => {
            const url = '/api/dashboards/create';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('POST', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.createDashboard()).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/dashboards/create';

            $httpBackend.expect('POST', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.createDashboard()).rejects.toThrow('Forbidden');
        });
    });

    describe('api.updateDashboard', () => {
        it('should call /api/dashboards/update/:id', () => {
            const url = '/api/dashboards/update/42';
            const dashboard = {
                _id: 42,
                dashboardName: 'foo',
            };
            const response = {
                result: 1,
                item: dashboard,
            };

            $httpBackend.expect('POST', url, dashboard).respond(response);

            const p = api.updateDashboard(dashboard);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(dashboard);
        });

        it('should throw if result is 0', () => {
            const url = '/api/dashboards/update/0';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('POST', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.updateDashboard({ _id: 0 })).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/dashboards/update/0';

            $httpBackend.expect('POST', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.updateDashboard({ _id: 0 })).rejects.toThrow('Forbidden');
        });
    });

    describe('api.getDashboardAsPDF', function () {
        it('should call /api/dashboards/:id/pdf', function () {
            const url = '/api/dashboards/foo/pdf';
            const response = {
                data: 'foodata',
            };

            $httpBackend.expect('POST', url).respond(response);

            const p = api.getDashboardAsPDF('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
        });
    });

    describe('api.getDashboardAsPNG', function () {
        it('should call /api/dashboards/:id/png', function () {
            const url = '/api/dashboards/foo/png';
            const response = {
                data: 'foodata',
            };

            $httpBackend.expect('POST', url).respond(response);

            const p = api.getDashboardAsPNG('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
        });
    });

    describe('api.isDashboardAsPDFAvailable', function () {
        it('should call OPTIONS /api/dashboards/:id/pdf and return false', function () {
            const url = '/api/dashboards/foo/pdf';

            $httpBackend.expect('OPTIONS', url).respond(501, '');

            const p = api.isDashboardAsPDFAvailable('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(false);
        });

        it('should call OPTIONS /api/dashboards/:id/pdf and return true', function () {
            const url = '/api/dashboards/foo/pdf';

            $httpBackend.expect('OPTIONS', url).respond(200, '');

            const p = api.isDashboardAsPDFAvailable('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(true);
        });
    });

    describe('api.isDashboardAsPNGAvailable', function () {
        it('should call OPTIONS /api/dashboards/:id/png and return false', function () {
            const url = '/api/dashboards/foo/png';

            $httpBackend.expect('OPTIONS', url).respond(501, '');

            const p = api.isDashboardAsPNGAvailable('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(false);
        });

        it('should call OPTIONS /api/dashboards/:id/png and return true', function () {
            const url = '/api/dashboards/foo/png';

            $httpBackend.expect('OPTIONS', url).respond(200, '');

            const p = api.isDashboardAsPNGAvailable('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(true);
        });
    });

    describe('api.getLayers', () => {
        it('should call /api/layers/find-all', () => {
            const url = '/api/layers/find-all' +
                '?fields=layerName&fields=owner' +
                '&filters=' + encodeURI('{"owner":"foo"}') +
                '&page=2&sort=owner&sortType=1';
            const response = {
                result: 1,
                items: [],
            };

            $httpBackend.expect('GET', url).respond(response);

            const params = {
                fields: ['layerName', 'owner'],
                filters: { owner: 'foo' },
                page: 2,
                sort: 'owner',
                sortType: 1,
            };
            const p = api.getLayers(params);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
        });

        it('should throw if result is 0', () => {
            const url = '/api/layers/find-all';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('GET', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.getLayers()).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/layers/find-all';

            $httpBackend.expect('GET', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.getLayers()).rejects.toThrow('Forbidden');
        });
    });

    describe('api.changeLayerStatus', function () {
        it('should call /api/layers/change-layer-status', function () {
            const url = '/api/layers/change-layer-status';
            const layerID = 'foo';
            const newStatus = 'active';
            const data = {
                layerID: layerID,
                status: newStatus,
            };

            $httpBackend.expect('POST', url, data).respond(204, '');

            const p = api.changeLayerStatus(layerID, newStatus);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toBe('');
        });
    });

    describe('api.getLayer', () => {
        it('should call /api/layers/find-one', () => {
            const url = '/api/layers/find-one?id=42';
            const layer = {
                layerName: 'foo',
            };
            const response = {
                result: 1,
                item: layer,
            };

            $httpBackend.expect('GET', url).respond(response);

            const p = api.getLayer(42);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(layer);
        });

        it('should throw if result is 0', () => {
            const url = '/api/layers/find-one';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('GET', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.getLayer()).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/layers/find-one';

            $httpBackend.expect('GET', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.getLayer()).rejects.toThrow('Forbidden');
        });
    });

    describe('api.createLayer', () => {
        it('should call /api/layers/create', () => {
            const url = '/api/layers/create';
            const layer = {
                layerName: 'foo',
            };
            const response = {
                result: 1,
                item: layer,
            };

            $httpBackend.expect('POST', url, layer).respond(response);

            const p = api.createLayer(layer);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
        });

        it('should throw if result is 0', () => {
            const url = '/api/layers/create';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('POST', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.createLayer()).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/layers/create';

            $httpBackend.expect('POST', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.createLayer()).rejects.toThrow('Forbidden');
        });
    });

    describe('api.updateLayer', () => {
        it('should call /api/layers/update/:id', () => {
            const url = '/api/layers/update/42';
            const layer = {
                _id: 42,
                layerName: 'foo',
            };
            const response = {
                result: 1,
                item: layer,
            };

            $httpBackend.expect('POST', url, layer).respond(response);

            const p = api.updateLayer(layer);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(layer);
        });

        it('should throw if result is 0', () => {
            const url = '/api/layers/update/0';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('POST', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.updateLayer({ _id: 0 })).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/layers/update/0';

            $httpBackend.expect('POST', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.updateLayer({ _id: 0 })).rejects.toThrow('Forbidden');
        });
    });

    describe('api.getUsers', function () {
        it('should call GET /api/users', function () {
            $httpBackend.expect('GET', '/api/users').respond({});

            setTimeout($httpBackend.flush);

            return expect(api.getUsers()).resolves.toEqual({});
        });
    });

    describe('api.getUser', function () {
        it('should call GET /api/users/:userId', function () {
            $httpBackend.expect('GET', '/api/users/foo').respond({});

            setTimeout($httpBackend.flush);

            return expect(api.getUser('foo')).resolves.toEqual({});
        });
    });

    describe('api.createUser', function () {
        it('should call POST /api/users', function () {
            $httpBackend.expect('POST', '/api/users').respond({});

            setTimeout($httpBackend.flush);

            return expect(api.createUser({})).resolves.toEqual({});
        });
    });

    describe('api.updateUser', function () {
        it('should call PATCH /api/users/:userId', function () {
            $httpBackend.expect('PATCH', '/api/users/foo').respond({});

            setTimeout($httpBackend.flush);

            return expect(api.updateUser('foo')).resolves.toEqual({});
        });
    });

    describe('api.deleteUserRole', function () {
        it('should call DELETE /api/users/:userId/roles/:roleId', function () {
            $httpBackend.expect('DELETE', '/api/users/foo/roles/bar').respond({});

            setTimeout($httpBackend.flush);

            return expect(api.deleteUserRole('foo', 'bar')).resolves.toEqual({});
        });
    });

    describe('api.addUserRole', function () {
        it('should call PUT /api/users/:userId/roles/:roleId', function () {
            $httpBackend.expect('PUT', '/api/users/foo/roles/bar').respond({});

            setTimeout($httpBackend.flush);

            return expect(api.addUserRole('foo', 'bar')).resolves.toEqual({});
        });
    });

    describe('api.getUserReports', function () {
        it('should call GET /api/users/:userId/reports', function () {
            $httpBackend.expect('GET', '/api/users/foo/reports').respond({});

            setTimeout($httpBackend.flush);

            return expect(api.getUserReports('foo')).resolves.toEqual({});
        });
    });

    describe('api.getUserDashboards', function () {
        it('should call GET /api/users/:userId/dashboards', function () {
            $httpBackend.expect('GET', '/api/users/foo/dashboards').respond({});

            setTimeout($httpBackend.flush);

            return expect(api.getUserDashboards('foo')).resolves.toEqual({});
        });
    });

    describe('api.getUserCounts', function () {
        it('should call GET /api/users/:userId/counts', function () {
            $httpBackend.expect('GET', '/api/users/foo/counts').respond({});

            setTimeout($httpBackend.flush);

            return expect(api.getUserCounts('foo')).resolves.toEqual({});
        });
    });
});
