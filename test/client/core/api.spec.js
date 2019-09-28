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

    describe('api.changeUserStatus', function () {
        it('should call /api/admin/users/change-user-status', function () {
            const url = '/api/admin/users/change-user-status';
            const userID = 'foo';
            const newStatus = 'active';
            const data = {
                userID: userID,
                status: newStatus,
            };

            $httpBackend.expect('POST', url, data).respond(204, '');

            const p = api.changeUserStatus(userID, newStatus);

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toBe('');
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
        it('should call /api/reports/:id.pdf', function () {
            const url = '/api/reports/foo.pdf';
            const response = {
                data: 'foodata',
            };

            $httpBackend.expect('GET', url).respond(response);

            const p = api.getReportAsPDF('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
        });
    });

    describe('api.getReportAsPNG', function () {
        it('should call /api/reports/:id.png', function () {
            const url = '/api/reports/foo.png';
            const response = {
                data: 'foodata',
            };

            $httpBackend.expect('GET', url).respond(response);

            const p = api.getReportAsPNG('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
        });
    });

    describe('api.getDashboards', () => {
        it('should call /api/dashboardsv2/find-all', () => {
            const url = '/api/dashboardsv2/find-all' +
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
            const url = '/api/dashboardsv2/find-all';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('GET', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.getDashboards()).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/dashboardsv2/find-all';

            $httpBackend.expect('GET', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.getDashboards()).rejects.toThrow('Forbidden');
        });
    });

    describe('api.getDashboard', () => {
        it('should call /api/dashboardsv2/find-one', () => {
            const url = '/api/dashboardsv2/find-one?id=42';
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
            const url = '/api/dashboardsv2/find-one';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('GET', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.getDashboard()).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/dashboardsv2/find-one';

            $httpBackend.expect('GET', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.getDashboard()).rejects.toThrow('Forbidden');
        });
    });

    describe('api.createDashboard', () => {
        it('should call /api/dashboardsv2/create', () => {
            const url = '/api/dashboardsv2/create';
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
            const url = '/api/dashboardsv2/create';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('POST', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.createDashboard()).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/dashboardsv2/create';

            $httpBackend.expect('POST', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.createDashboard()).rejects.toThrow('Forbidden');
        });
    });

    describe('api.updateDashboard', () => {
        it('should call /api/dashboardsv2/update/:id', () => {
            const url = '/api/dashboardsv2/update/42';
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
            const url = '/api/dashboardsv2/update/0';
            const response = {
                result: 0,
                msg: 'Caught an error',
            };

            $httpBackend.expect('POST', url).respond(response);

            setTimeout($httpBackend.flush);

            return expect(api.updateDashboard({ _id: 0 })).rejects.toThrow('Caught an error');
        });

        it('should throw if request failed', () => {
            const url = '/api/dashboardsv2/update/0';

            $httpBackend.expect('POST', url).respond(403, 'Forbidden');

            setTimeout($httpBackend.flush);

            return expect(api.updateDashboard({ _id: 0 })).rejects.toThrow('Forbidden');
        });
    });

    describe('api.getDashboardAsPDF', function () {
        it('should call /api/dashboards/:id.pdf', function () {
            const url = '/api/dashboards/foo.pdf';
            const response = {
                data: 'foodata',
            };

            $httpBackend.expect('GET', url).respond(response);

            const p = api.getDashboardAsPDF('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
        });
    });

    describe('api.getDashboardAsPNG', function () {
        it('should call /api/dashboards/:id.png', function () {
            const url = '/api/dashboards/foo.png';
            const response = {
                data: 'foodata',
            };

            $httpBackend.expect('GET', url).respond(response);

            const p = api.getDashboardAsPNG('foo');

            setTimeout($httpBackend.flush);

            return expect(p).resolves.toEqual(response);
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
});
