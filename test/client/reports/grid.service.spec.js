require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/api.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/layers/layers.module.js');
require('../../../public/js/layers/layer.service.js');
require('../../../public/js/reports/reports.module.js');
require('../../../public/js/reports/reports.service.js');
require('../../../public/js/reports/grid.service.js');

describe('grid', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.reports'));
    beforeEach(angular.mock.module('app.layers'));

    let grid;
    let $httpBackend;

    beforeEach(inject(function (_grid_, _$httpBackend_) {
        grid = _grid_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('createGrid', function () {
        it('should create a table', function () {
            document.body.innerHTML = '<div id="main"></div>';
            const element = $('#main');
            const report = {
                selectedLayerID: 'foo',
                properties: {
                    columns: [
                        {
                            label: 'Bar',
                            elementID: 'quux',
                            elementType: 'number',
                            id: 'equuxraw',
                            calculateTotal: true,
                        },
                    ],
                }
            };
            const rows = [
                {
                    equuxraw: 18,
                },
                {
                    equuxraw: 24,
                },
            ];

            $httpBackend.expect('GET', '/api/layers/find-one?id=foo')
                .respond({
                    result: 1,
                    item: {
                        objects: [
                            {
                                elementID: 'quux',
                                elementType: 'number',
                                format: '0.00',
                            },
                        ],
                    },
                });

            grid.createGrid(element, report, rows);

            $httpBackend.flush();

            const reportGrid = element.find('.report-grid');
            expect(reportGrid).toHaveLength(1);
            expect(reportGrid.find('table')).toHaveLength(1);
            expect(reportGrid.find('table > thead > tr > th')).toHaveLength(1);
            expect(reportGrid.find('table > thead > tr > th').text()).toBe('Bar');
            expect(reportGrid.find('table > tbody > tr')).toHaveLength(2);
            expect(reportGrid.find('table > tbody > tr:eq(0) > td').text()).toBe('18.00');
            expect(reportGrid.find('table > tbody > tr:eq(1) > td').text()).toBe('24.00');
            expect(reportGrid.find('table > tfoot > tr')).toHaveLength(1);
            expect(reportGrid.find('table > tfoot > tr > th').text()).toBe('42.00');
        });

        it('should create a vertical table', function () {
            document.body.innerHTML = '<div id="main"></div>';
            const element = $('#main');
            const report = {
                selectedLayerID: 'foo',
                properties: {
                    columns: [
                        {
                            label: 'Bar',
                            elementID: 'quux',
                            elementType: 'number',
                            id: 'equuxraw',
                            calculateTotal: true,
                        },
                    ],
                }
            };
            const rows = [
                {
                    equuxraw: 18,
                },
                {
                    equuxraw: 24,
                },
            ];

            $httpBackend.expect('GET', '/api/layers/find-one?id=foo')
                .respond({
                    result: 1,
                    item: {
                        objects: [
                            {
                                elementID: 'quux',
                                elementType: 'number',
                                format: '0.00',
                            },
                        ],
                    },
                });

            grid.createGrid(element, report, rows, { vertical: true });

            $httpBackend.flush();

            const reportGrid = element.find('.report-grid');
            expect(reportGrid).toHaveLength(1);
            expect(reportGrid.find('table')).toHaveLength(1);
            expect(reportGrid.find('table > colgroup')).toHaveLength(1);
            expect(reportGrid.find('table > thead')).toHaveLength(0);
            expect(reportGrid.find('table > tbody')).toHaveLength(2);
            expect(reportGrid.find('table > tbody:eq(0) > tr')).toHaveLength(1);
            expect(reportGrid.find('table > tbody:eq(0) > tr > th')).toHaveLength(1);
            expect(reportGrid.find('table > tbody:eq(0) > tr > th').text()).toBe('Bar');
            expect(reportGrid.find('table > tbody:eq(0) > tr > td')).toHaveLength(1);
            expect(reportGrid.find('table > tbody:eq(0) > tr > td').text()).toBe('18.00');
            expect(reportGrid.find('table > tbody:eq(1) > tr')).toHaveLength(1);
            expect(reportGrid.find('table > tbody:eq(1) > tr > th')).toHaveLength(1);
            expect(reportGrid.find('table > tbody:eq(1) > tr > th').text()).toBe('Bar');
            expect(reportGrid.find('table > tbody:eq(1) > tr > td')).toHaveLength(1);
            expect(reportGrid.find('table > tbody:eq(1) > tr > td').text()).toBe('24.00');
            expect(reportGrid.find('table > tfoot')).toHaveLength(1);
            expect(reportGrid.find('table > tfoot > tr')).toHaveLength(1);
            expect(reportGrid.find('table > tfoot > tr > th')).toHaveLength(1);
            expect(reportGrid.find('table > tfoot > tr > th').text()).toBe('Total (Bar)');
            expect(reportGrid.find('table > tfoot > tr > td')).toHaveLength(1);
            expect(reportGrid.find('table > tfoot > tr > td').text()).toBe('42.00');
        });
    });
});
