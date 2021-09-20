const Knex = require('knex');
const SqlQueryBuilder = require('../../../server/core/sqlQueryBuilder.js');

describe('SqlQueryBuilder', function () {
    let sqlQueryBuilder;
    let knex;

    beforeEach(function () {
        knex = Knex({ client: 'mysql' });
        sqlQueryBuilder = new SqlQueryBuilder(knex);
    });

    describe('when filter is equal-pattern and THISMONTH', function () {
        let qb;

        beforeEach(function () {
            const query = {
                joinTree: {
                    collection: {
                        collectionID: 'Cabcd',
                        collectionName: 'A',
                    },
                    joins: [],
                },
                columns: [
                    {
                        id: 'eabcdraw',
                        elementID: 'abcd',
                        elementName: 'foo',
                        collectionID: 'A',
                    },
                ],
                filters: [
                    {
                        elementType: 'date',
                        elementName: 'foo',
                        collectionID: 'A',
                        filterType: 'equal-pattern',
                        criterion: {
                            date1: Date.now(),
                            datePattern: '#WST-THISMONTH#',
                        }
                    },
                ],
                groupKeys: [],
                order: [],
            };
            qb = sqlQueryBuilder.build(query);
        });

        it('should generate correct sql', function () {
            const sql = qb.toSQL();
            const expectedSql = 'select `abcd` as `eabcdraw` from (' +
                'select `A`.`foo` as `abcd` from `A` as `Cabcd` ' +
                'where (`A`.`foo` >= ? and `A`.`foo` < ?)' +
                ') as `sub`';
            expect(sql.sql).toBe(expectedSql);
        });

        it('should generate correct bindings', function () {
            const sql = qb.toSQL();
            const today = new Date();
            const firstDayOfThisMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1));
            const firstDayOfNextMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 1));
            expect(sql.bindings).toHaveLength(2);
            expect(sql.bindings[0]).toEqual(firstDayOfThisMonth.toISOString().slice(0, 10));
            expect(sql.bindings[1]).toEqual(firstDayOfNextMonth.toISOString().slice(0, 10));
        });
    });

    describe('when filter is equal-pattern and LASTMONTH', function () {
        let qb;

        beforeEach(function () {
            const query = {
                joinTree: {
                    collection: {
                        collectionID: 'Cabcd',
                        collectionName: 'A',
                    },
                    joins: [],
                },
                columns: [
                    {
                        id: 'eabcdraw',
                        elementID: 'abcd',
                        elementName: 'foo',
                        collectionID: 'A',
                    },
                ],
                filters: [
                    {
                        elementType: 'date',
                        elementName: 'foo',
                        collectionID: 'A',
                        filterType: 'equal-pattern',
                        criterion: {
                            date1: Date.now(),
                            datePattern: '#WST-LASTMONTH#',
                        }
                    },
                ],
                groupKeys: [],
                order: [],
            };
            qb = sqlQueryBuilder.build(query);
        });

        it('should generate correct sql', function () {
            const sql = qb.toSQL();
            const expectedSql = 'select `abcd` as `eabcdraw` from (' +
                'select `A`.`foo` as `abcd` from `A` as `Cabcd` ' +
                'where (`A`.`foo` >= ? and `A`.`foo` < ?)' +
                ') as `sub`';
            expect(sql.sql).toBe(expectedSql);
        });

        it('should generate correct bindings', function () {
            const sql = qb.toSQL();
            const today = new Date();
            const firstDayOfLastMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth() - 1, 1));
            const firstDayOfThisMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1));
            expect(sql.bindings).toHaveLength(2);
            expect(sql.bindings[0]).toEqual(firstDayOfLastMonth.toISOString().slice(0, 10));
            expect(sql.bindings[1]).toEqual(firstDayOfThisMonth.toISOString().slice(0, 10));
        });
    });
});
