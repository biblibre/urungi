require('../../../public/js/core/core.module.js');
require('../../../public/js/reports/reports.module.js');
require('../../../public/js/reports/reports.service.js');

describe('reportsService', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.reports'));

    let reportsService;

    beforeEach(inject(function (_reportsService_) {
        reportsService = _reportsService_;
    }));

    describe('getColumnId', function () {
        it('should return correct id for columns without aggregation', function () {
            const column = {
                elementID: 'quux',
            };
            const id = reportsService.getColumnId(column);

            expect(id).toBe('equuxraw');
        });

        it('should return correct id for columns with aggregation sum', function () {
            const column = {
                elementID: 'quux',
                aggregation: 'sum',
            };
            const id = reportsService.getColumnId(column);

            expect(id).toBe('equuxsum');
        });

        it('should return correct id for columns with aggregation avg', function () {
            const column = {
                elementID: 'quux',
                aggregation: 'avg',
            };
            const id = reportsService.getColumnId(column);

            expect(id).toBe('equuxavg');
        });

        it('should return correct id for columns with aggregation min', function () {
            const column = {
                elementID: 'quux',
                aggregation: 'min',
            };
            const id = reportsService.getColumnId(column);

            expect(id).toBe('equuxmin');
        });

        it('should return correct id for columns with aggregation max', function () {
            const column = {
                elementID: 'quux',
                aggregation: 'max',
            };
            const id = reportsService.getColumnId(column);

            expect(id).toBe('equuxmax');
        });

        it('should return correct id for columns with aggregation count', function () {
            const column = {
                elementID: 'quux',
                aggregation: 'count',
            };
            const id = reportsService.getColumnId(column);

            expect(id).toBe('equuxcou');
        });

        it('should return correct id for columns with aggregation countDistinct', function () {
            const column = {
                elementID: 'quux',
                aggregation: 'countDistinct',
            };
            const id = reportsService.getColumnId(column);

            expect(id).toBe('equuxcou');
        });
    });

    describe('getColumnDescription', function () {
        it('should return correct description for columns without aggregation', function () {
            const column = {
                elementLabel: 'Quux',
            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Quux');
        });

        it('should return correct description for columns with aggregation sum', function () {
            const column = {
                elementLabel: 'Quux',
                aggregation: 'sum',
            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Quux (Sum)');
        });

        it('should return correct description for columns with aggregation avg', function () {
            const column = {
                elementLabel: 'Quux',
                aggregation: 'avg',
            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Quux (Avg)');
        });

        it('should return correct description for columns with aggregation min', function () {
            const column = {
                elementLabel: 'Quux',
                aggregation: 'min',
            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Quux (Min)');
        });

        it('should return correct description for columns with aggregation max', function () {
            const column = {
                elementLabel: 'Quux',
                aggregation: 'max',
            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Quux (Max)');
        });

        it('should return correct description for columns with aggregation count', function () {
            const column = {
                elementLabel: 'Quux',
                aggregation: 'count',
            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Quux (Count)');
        });

        it('should return correct description for columns with aggregation countDistinct', function () {
            const column = {
                elementLabel: 'Quux',
                aggregation: 'countDistinct',
            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Quux (Count distinct)');
        });
    });
});
