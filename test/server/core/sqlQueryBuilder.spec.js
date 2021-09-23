const Knex = require('knex');
const SqlQueryBuilder = require('../../../server/core/sqlQueryBuilder.js');

describe('SqlQueryBuilder', function () {
    let sqlQueryBuilder;
    let knex;
    const baseQuery = {
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
        filters: [],
        groupKeys: [],
        order: [],
    };

    beforeEach(function () {
        knex = Knex({ client: 'mysql' });
        sqlQueryBuilder = new SqlQueryBuilder(knex);
    });

    describe('when filter is equal-pattern and THISMONTH', function () {
        let qb;

        beforeEach(function () {
            const query = JSON.parse(JSON.stringify(baseQuery));
            query.filters = [
                {
                    elementType: 'date',
                    elementName: 'foo',
                    collectionID: 'A',
                    filterType: 'equal-pattern',
                    criterion: {
                        datePattern: '#WST-THISMONTH#',
                    }
                },
            ];
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
            const query = JSON.parse(JSON.stringify(baseQuery));
            query.filters = [
                {
                    elementType: 'date',
                    elementName: 'foo',
                    collectionID: 'A',
                    filterType: 'equal-pattern',
                    criterion: {
                        datePattern: '#WST-LASTMONTH#',
                    }
                },
            ];
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

    describe('filter type BETWEEN', function () {
        test('no dates', function () {
            const query = JSON.parse(JSON.stringify(baseQuery));
            query.filters = [
                {
                    elementType: 'date',
                    elementName: 'foo',
                    collectionID: 'A',
                    filterType: 'between',
                    criterion: {
                    }
                },
            ];
            const qb = sqlQueryBuilder.build(query);

            const sql = qb.toSQL();
            const expectedSql = 'select `abcd` as `eabcdraw` from (' +
                'select `A`.`foo` as `abcd` from `A` as `Cabcd`' +
                ') as `sub`';
            expect(sql.sql).toBe(expectedSql);
        });

        test('only one date', function () {
            const query = JSON.parse(JSON.stringify(baseQuery));
            query.filters = [
                {
                    elementType: 'date',
                    elementName: 'foo',
                    collectionID: 'A',
                    filterType: 'between',
                    criterion: {
                        date1: Date.now(),
                    }
                },
            ];
            const qb = sqlQueryBuilder.build(query);

            const sql = qb.toSQL();
            const expectedSql = 'select `abcd` as `eabcdraw` from (' +
                'select `A`.`foo` as `abcd` from `A` as `Cabcd` ' +
                'where (`A`.`foo` >= ?)' +
                ') as `sub`';
            expect(sql.sql).toBe(expectedSql);
        });

        test('only second date', function () {
            const query = JSON.parse(JSON.stringify(baseQuery));
            query.filters = [
                {
                    elementType: 'date',
                    elementName: 'foo',
                    collectionID: 'A',
                    filterType: 'between',
                    criterion: {
                        date2: Date.now(),
                    }
                },
            ];
            const qb = sqlQueryBuilder.build(query);

            const sql = qb.toSQL();
            const expectedSql = 'select `abcd` as `eabcdraw` from (' +
                'select `A`.`foo` as `abcd` from `A` as `Cabcd` ' +
                'where (`A`.`foo` <= ?)' +
                ') as `sub`';
            expect(sql.sql).toBe(expectedSql);
        });

        test('two dates', function () {
            const query = JSON.parse(JSON.stringify(baseQuery));
            query.filters = [
                {
                    elementType: 'date',
                    elementName: 'foo',
                    collectionID: 'A',
                    filterType: 'between',
                    criterion: {
                        date1: new Date(1970, 0, 1),
                        date2: new Date(2001, 11, 31)
                    }
                },
            ];
            const qb = sqlQueryBuilder.build(query);

            const sql = qb.toSQL();
            const expectedSql = 'select `abcd` as `eabcdraw` from (' +
                'select `A`.`foo` as `abcd` from `A` as `Cabcd` ' +
                'where (`A`.`foo` between ? and ?)' +
                ') as `sub`';
            expect(sql.sql).toBe(expectedSql);
            expect(sql.bindings).toHaveLength(2);
            expect(sql.bindings[0]).toEqual('1970-01-01');
            expect(sql.bindings[1]).toEqual('2001-12-31');
        });
    });

    describe('filter type NOT BETWEEN', function () {
        test('no dates', function () {
            const query = JSON.parse(JSON.stringify(baseQuery));
            query.filters = [
                {
                    elementType: 'date',
                    elementName: 'foo',
                    collectionID: 'A',
                    filterType: 'notBetween',
                    criterion: {
                    }
                },
            ];
            const qb = sqlQueryBuilder.build(query);

            const sql = qb.toSQL();
            const expectedSql = 'select `abcd` as `eabcdraw` from (' +
                'select `A`.`foo` as `abcd` from `A` as `Cabcd`' +
                ') as `sub`';
            expect(sql.sql).toBe(expectedSql);
        });

        test('only first date', function () {
            const query = JSON.parse(JSON.stringify(baseQuery));
            query.filters = [
                {
                    elementType: 'date',
                    elementName: 'foo',
                    collectionID: 'A',
                    filterType: 'notBetween',
                    criterion: {
                        date1: Date.now(),
                    }
                },
            ];
            const qb = sqlQueryBuilder.build(query);

            const sql = qb.toSQL();
            const expectedSql = 'select `abcd` as `eabcdraw` from (' +
                'select `A`.`foo` as `abcd` from `A` as `Cabcd` ' +
                'where (`A`.`foo` < ?)' +
                ') as `sub`';
            expect(sql.sql).toBe(expectedSql);
        });

        test('only second date', function () {
            const query = JSON.parse(JSON.stringify(baseQuery));
            query.filters = [
                {
                    elementType: 'date',
                    elementName: 'foo',
                    collectionID: 'A',
                    filterType: 'notBetween',
                    criterion: {
                        date2: Date.now(),
                    }
                },
            ];
            const qb = sqlQueryBuilder.build(query);

            const sql = qb.toSQL();
            const expectedSql = 'select `abcd` as `eabcdraw` from (' +
                'select `A`.`foo` as `abcd` from `A` as `Cabcd` ' +
                'where (`A`.`foo` > ?)' +
                ') as `sub`';
            expect(sql.sql).toBe(expectedSql);
        });

        test('two dates', function () {
            const query = JSON.parse(JSON.stringify(baseQuery));
            query.filters = [
                {
                    elementType: 'date',
                    elementName: 'foo',
                    collectionID: 'A',
                    filterType: 'notBetween',
                    criterion: {
                        date1: new Date(1970, 0, 1),
                        date2: new Date(2001, 11, 31)
                    }
                },
            ];
            const qb = sqlQueryBuilder.build(query);

            const sql = qb.toSQL();
            const expectedSql = 'select `abcd` as `eabcdraw` from (' +
                'select `A`.`foo` as `abcd` from `A` as `Cabcd` ' +
                'where (`A`.`foo` not between ? and ?)' +
                ') as `sub`';
            expect(sql.sql).toBe(expectedSql);
            expect(sql.bindings).toHaveLength(2);
            expect(sql.bindings[0]).toEqual('1970-01-01');
            expect(sql.bindings[1]).toEqual('2001-12-31');
        });
    });
});
