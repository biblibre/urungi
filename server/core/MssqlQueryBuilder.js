const SqlQueryBuilder = require('./SqlQueryBuilder.js');

class MssqlQueryBuilder extends SqlQueryBuilder {
    getOrderByAndLimit (query) {
        let sql = '';
        const orderBy = this.getOrderBy(query);
        if (orderBy) {
            sql = `ORDER BY ${orderBy}`;
        }

        if (query.recordLimit) {
            if (!sql) {
                sql = 'ORDER BY (SELECT NULL)';
            }
            sql += ` OFFSET 0 ROWS FETCH FIRST ${query.recordLimit} ROWS ONLY`;
        }

        return sql;
    }

    getSubqueryOrderByAndLimit (query) {
        if (query.quickResultLimit) {
            return `ORDER BY (SELECT NULL) OFFSET 0 ROWS FETCH FIRST ${query.quickResultLimit} ROWS ONLY`;
        }
    }
}

module.exports = MssqlQueryBuilder;
