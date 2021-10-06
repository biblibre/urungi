const MssqlQueryBuilder = require('../../../server/core/MssqlQueryBuilder.js');
const queryBuilderTestCases = require('./__data__/query-builder-test-cases.js');

describe('MssqlQueryBuilder', function () {
    const qb = new MssqlQueryBuilder();

    test.each(queryBuilderTestCases)('$name', function ({ query, expectedSql }) {
        expect(qb.build(query)).toBe(expectedSql.mssql);
    });
});
