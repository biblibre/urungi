const OracleQueryBuilder = require('../../../server/core/OracleQueryBuilder.js');
const queryBuilderTestCases = require('./__data__/query-builder-test-cases.js');

describe('OracleQueryBuilder', function () {
    const qb = new OracleQueryBuilder();

    test.each(queryBuilderTestCases)('$name', function ({ query, expectedSql }) {
        expect(qb.build(query)).toBe(expectedSql.oracle);
    });
});
