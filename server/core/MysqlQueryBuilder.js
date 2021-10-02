const SqlQueryBuilder = require('./SqlQueryBuilder.js');

class MysqlQueryBuilder extends SqlQueryBuilder {
    getOrderByAndLimit (query) {
        let sql = '';

        const orderBy = this.getOrderBy(query);
        if (orderBy) {
            sql += `ORDER BY ${orderBy}`;
        }

        if (query.recordLimit) {
            const limit = Number(query.recordLimit);
            sql += ` LIMIT ${limit}`;
        }

        return sql.trimStart();
    }

    getSubqueryOrderByAndLimit (query) {
        if (query.quickResultLimit) {
            const limit = Number(query.quickResultLimit);
            return `LIMIT ${limit}`;
        }
    }

    quoteIdentifier (identifier) {
        return this.quote(identifier, '`');
    }
}

module.exports = MysqlQueryBuilder;
