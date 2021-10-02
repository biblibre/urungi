const PgQueryBuilder = require('../../../server/core/PgQueryBuilder.js');
const queryBuilderTestCases = require('./__data__/query-builder-test-cases.js');

describe('PgQueryBuilder', function () {
    const qb = new PgQueryBuilder();

    test.each(queryBuilderTestCases)('$name', function ({ query, expectedSql }) {
        expect(qb.build(query)).toBe(expectedSql.pg);
    });
});
