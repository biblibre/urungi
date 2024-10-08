require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/core/core.api.service.js');
require('../../../../public/js/ng/core/core.connection.service.js');
require('../../../../public/js/ng/report/report.module.js');
require('../../../../public/js/ng/report/report.c3-charts.service.js');
require('../../../../public/js/ng/report/report.reports-service.service.js');

describe('c3Charts', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.report'));

    let c3Charts;

    beforeEach(inject(function (_c3Charts_) {
        c3Charts = _c3Charts_;
    }));

    describe('getCategoryForPyramid', function () {
        it.each([
            [2, [20, 30, 40, 50, 60], '< 20'],
            [-12, [20, 30, 40, 50, 60], '< 20'],
            [70, [20, 30, 40, 50, 60], '> 60'],
            [30, [20, 30, 40, 50, 60], '30 - 40'],
            [32, [20, 30, 40, 50, 60], '30 - 40'],
            [32, [30], '> 30'],
            [3, [1, 2, 3, 4, 5], '3 - 4'],
        ])('getCategoryForPyramid(%i, %j) === "%s"', function (metric, limits, category) {
            expect(c3Charts.getCategoryForPyramid(metric, limits)).toEqual(category);
        });
    });

    describe('getC3ConfigForPyramid', function () {
        it('should fill config with correct values', function () {
            const config = {};
            const chart = {
                dataAxis: {
                    id: 'ebwqoraw',
                },
                dataColumns: [
                    {
                        id: 'eczhbraw',
                    },
                ],
                range: '20/30',
            };
            const data = [
                {
                    ebwqoraw: 'M',
                    eczhbraw: 10
                },
                {
                    ebwqoraw: 'F',
                    eczhbraw: 25
                },
                {
                    ebwqoraw: 'M',
                    eczhbraw: 48
                }
            ];
            c3Charts.getC3ConfigForPyramid(config, data, chart);

            expect(config).toEqual({
                axis: {
                    rotated: true,
                    x: {
                        categories: ['> 30', '20 - 30', '< 20'],
                        type: 'categories',
                    },
                    y: {
                        max: 1,
                        min: -1,
                        tick: {
                            format: expect.any(Function),
                        },
                    },
                },
                data: {
                    columns: [
                        ['M', -1, -0, -1],
                        ['F', 0, 1, 0],
                    ],
                    groups: [['M', 'F']],
                    type: 'bar',
                },
                grid: {
                    y: {
                        lines: [{ value: 0 }],
                    },
                },
            });
        });
    });
});
