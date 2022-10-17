require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/core/core.api.service.js');
require('../../../../public/js/ng/core/core.connection.service.js');
require('../../../../public/js/ng/report/report.module.js');
require('../../../../public/js/ng/report/report.grid.service.js');
require('../../../../public/js/ng/report/report.reports-service.service.js');

describe('grid', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.report'));

    let grid;

    beforeEach(inject(function (_grid_) {
        grid = _grid_;
    }));

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
                            layerObject: {
                                elementType: 'number',
                                elementLabel: 'Foo',
                                format: '0.00',
                            },
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

            grid.createGrid(element, report, rows);

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
                            layerObject: {
                                elementType: 'number',
                                elementLabel: 'Foo',
                                format: '0.00',
                            },
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

            grid.createGrid(element, report, rows, { vertical: true });

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
