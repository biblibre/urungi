const MysqlQueryBuilder = require('../../../server/core/MysqlQueryBuilder.js');
const queryBuilderTestCases = require('./__data__/query-builder-test-cases.js');

describe('MyqlQueryBuilder', function () {
    const qb = new MysqlQueryBuilder();

    test.each(queryBuilderTestCases)('$name', function ({ query, expectedSql }) {
        expect(qb.build(query)).toBe(expectedSql.mysql);
    });
});
