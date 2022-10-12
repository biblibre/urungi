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
                layerObject: {
                    elementLabel: 'Foo',
                }
            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Foo');
        });

        it('should return correct description for columns with aggregation sum', function () {
            const column = {
                elementLabel: 'Quux',
                layerObject: {
                    elementLabel: 'Foo',
                },
                aggregation: 'sum',
            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Foo (Sum)');
        });

        it('should return correct description for columns with aggregation avg', function () {
            const column = {
                elementLabel: 'Quux',
                layerObject: {
                    elementLabel: 'Foo',
                },
                aggregation: 'avg',
            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Foo (Avg)');
        });

        it('should return correct description for columns with aggregation min', function () {
            const column = {
                elementLabel: 'Quux',
                layerObject: {
                    elementLabel: 'Foo',
                },
                aggregation: 'min',
            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Foo (Min)');
        });

        it('should return correct description for columns with aggregation max', function () {
            const column = {
                elementLabel: 'Quux',
                layerObject: {
                    elementLabel: 'Foo',
                },
                aggregation: 'max',
            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Foo (Max)');
        });

        it('should return correct description for columns with aggregation count', function () {
            const column = {
                elementLabel: 'Quux',
                layerObject: {
                    elementLabel: 'Foo',
                },
                aggregation: 'count',
            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Foo (Count)');
        });

        it('should return correct description for columns with aggregation countDistinct', function () {
            const column = {
                elementLabel: 'Quux',
                layerObject: {
                    elementLabel: 'Foo',
                },
                aggregation: 'countDistinct',

            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Foo (Count distinct)');
        });

        it('should return correct description for columns with custom label', function () {
            const column = {
                elementLabel: 'Quux',
                layerObject: {
                    elementLabel: 'Foo',
                },
                aggregation: 'max',
                label: 'Maximum Quux',
            };
            const description = reportsService.getColumnDescription(column);

            expect(description).toBe('Maximum Quux');
        });
    });

    describe('checkPrompt', function () {
        it('should return true if prompt with date filter type filled correctly', function () {
            const prompt1 = {
                elementType: 'date',
                filterType: 'between',
                criterion: {
                    text1: '2020-01-01',
                    text2: '2022-01-01'
                }
            };

            const prompt2 = {
                elementType: 'date',
                filterType: 'equal-pattern',
                criterion: {
                    datePattern: '#WST-TODAY#'
                }
            };

            const prompt3 = {
                elementType: 'date',
                filterType: 'equal',
                criterion: {
                    text1: '2020-31-01',
                }
            };

            const boolean1 = reportsService.checkPrompt(prompt1);
            const boolean2 = reportsService.checkPrompt(prompt2);
            const boolean3 = reportsService.checkPrompt(prompt3);

            expect(boolean1).toBe(true);
            expect(boolean2).toBe(true);
            expect(boolean3).toBe(true);
        });

        it('should return true if prompt with another filter type than date filled correctly', function () {
            const prompt1 = {
                elementType: 'number',
                filterType: 'between',
                criterion: {
                    text1: '100',
                    text2: '200'
                }
            };

            const prompt2 = {
                elementType: 'string',
                filterType: 'equal',
                criterion: {
                    text1: 'foo',
                }
            };

            const boolean1 = reportsService.checkPrompt(prompt1);
            const boolean2 = reportsService.checkPrompt(prompt2);

            expect(boolean1).toBe(true);
            expect(boolean2).toBe(true);
        });

        it('should return false if prompt with date filter type is not filled correctly', function () {
            const prompt1 = {
                elementType: 'date',
                filterType: 'between',
                criterion: {
                    text1: '2020-01-01',
                }
            };

            const prompt2 = {
                elementType: 'date',
                filterType: 'equal-pattern',
                criterion: {
                    label: '',
                    datePattern: ''
                }
            };

            const prompt3 = {
                elementType: 'date',
                filterType: 'equal',
                criterion: {}
            };

            const boolean1 = reportsService.checkPrompt(prompt1);
            const boolean2 = reportsService.checkPrompt(prompt2);
            const boolean3 = reportsService.checkPrompt(prompt3);

            expect(boolean1).toBe(false);
            expect(boolean2).toBe(false);
            expect(boolean3).toBe(false);
        });

        it('should return false if prompt with another filter type than date is not filled correctly', function () {
            const prompt1 = {
                elementType: 'number',
                filterType: 'between',
                criterion: {
                    text1: '100',
                }
            };

            const prompt2 = {
                elementType: 'string',
                filterType: 'equal',
                criterion: {}
            };

            const boolean1 = reportsService.checkPrompt(prompt1);
            const boolean2 = reportsService.checkPrompt(prompt2);

            expect(boolean1).toBe(false);
            expect(boolean2).toBe(false);
        });

        it('should return true if filterType == "in" and textList is not empty', function () {
            const isValid = reportsService.checkPrompt({
                elementType: 'string',
                filterType: 'in',
                criterion: {
                    textList: ['foo'],
                },
            });
            expect(isValid).toBe(true);
        });

        it('should return false if filterType == "in" and textList is empty', function () {
            const isValid = reportsService.checkPrompt({
                elementType: 'string',
                filterType: 'in',
                criterion: {
                    textList: [],
                },
            });
            expect(isValid).toBe(false);
        });

        it('should return true if filterType == "not in" and textList is not empty', function () {
            const isValid = reportsService.checkPrompt({
                elementType: 'string',
                filterType: 'not in',
                criterion: {
                    textList: ['foo'],
                },
            });
            expect(isValid).toBe(true);
        });

        it('should return false if filterType == "not in" and textList is empty', function () {
            const isValid = reportsService.checkPrompt({
                elementType: 'string',
                filterType: 'not in',
                criterion: {
                    textList: [],
                },
            });
            expect(isValid).toBe(false);
        });
    });
});
