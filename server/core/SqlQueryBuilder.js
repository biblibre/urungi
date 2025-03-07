const dateHelper = require('../helpers/date.js');

class SqlQueryBuilder {
    build (query) {
        this.query = query;
        const select = this.getSelect(query);
        const from = this.getFrom(query);

        let sql = `SELECT ${select} FROM ${from}`;

        const groupBy = this.getGroupBy(query);
        if (groupBy) {
            sql += ` GROUP BY ${groupBy}`;
        }

        const orderByAndLimit = this.getOrderByAndLimit(query);
        if (orderByAndLimit) {
            sql += ` ${orderByAndLimit}`;
        }

        return sql;
    }

    getSelect (query) {
        if (!Array.isArray(query.columns) || query.columns.length === 0) {
            throw new Error('The given query does not contain any column');
        }

        const select = query.columns.map(column => {
            const id = this.quoteIdentifier(column.elementID);
            const alias = this.quoteIdentifier(column.id);
            let expr;

            switch (column.aggregation) {
            case 'sum': case 'avg': case 'min': case 'max': case 'count':
                expr = `${column.aggregation.toUpperCase()}(${id})`;
                break;

            case 'countDistinct':
                expr = `COUNT(DISTINCT ${id})`;
                break;

            default:
                expr = id;
            }

            return `${expr} AS ${alias}`;
        }).join(', ');

        return select;
    }

    getFrom (query) {
        const subquerySql = this.getSubquery(query);
        const subqueryAlias = this.quoteIdentifier('sub');

        return `(${subquerySql}) ${subqueryAlias}`;
    }

    getGroupBy (query) {
        if (!Array.isArray(query.groupKeys)) {
            return '';
        }

        const groupByColumns = query.groupKeys.slice();

        if (Array.isArray(query.order)) {
            for (const order of query.order) {
                // If there is a GROUP BY clause, it should contain all columns
                // used in the ORDER BY clause.
                // https://dev.mysql.com/doc/refman/5.7/en/group-by-handling.html
                if (query.groupKeys.length > 0 && !order.aggregation) {
                    const alreadyInGroupBy = query.groupKeys.some(e => e.elementID === order.elementID);
                    if (!alreadyInGroupBy) {
                        groupByColumns.push(order);
                    }
                }
            }
        }

        return groupByColumns.map(c => this.quoteIdentifier(c.elementID)).join(', ');
    }

    getOrderBy (query) {
        if (!Array.isArray(query.order)) {
            return '';
        }

        const orderBy = query.order.map(c => {
            const direction = c.sortDesc ? 'DESC' : 'ASC';
            const id = this.quoteIdentifier(c.elementID);

            return `${id} ${direction}`;
        }).join(', ');

        return orderBy;
    }

    getOrderByAndLimit (query) {
        let sql = '';

        const orderBy = this.getOrderBy(query);
        if (orderBy) {
            sql += `ORDER BY ${orderBy}`;
        }

        if (query.recordLimit) {
            sql += ` FETCH FIRST ${query.recordLimit} ROWS ONLY`;
        }

        return sql.trimStart();
    }

    getSubqueryOrderByAndLimit (query) {
        if (query.quickResultLimit) {
            return `FETCH FIRST ${query.quickResultLimit} ROWS ONLY`;
        }
    }

    getSubquery (query) {
        if (!Array.isArray(query.columns) || query.columns.length === 0) {
            throw new Error('The given query does not contain any column');
        }

        const columns = query.columns.slice();
        if (Array.isArray(query.order)) {
            Array.prototype.push.apply(columns, query.order);
        }

        const selectMap = new Map(columns.map(c => [c.elementID, c]));
        const select = Array.from(selectMap.entries()).map(([alias, column]) => {
            return this.getColumn(column) + ' AS ' + this.quoteIdentifier(alias);
        }).join(', ');

        let from = this.getCollection(query.joinTree.collection);
        if (Array.isArray(query.joinTree.joins)) {
            for (const join of query.joinTree.joins) {
                from += ' ' + this.buildJoin(join);
            }
        }

        let sql = `SELECT ${select} FROM ${from}`;

        if (Array.isArray(query.filters)) {
            const sqlFragments = query.filters.map(f => this.getFilter(f));
            const where = sqlFragments.filter(f => f).join(' AND ');
            if (where) {
                sql += ` WHERE ${where}`;
            }
        }

        const orderByAndLimit = this.getSubqueryOrderByAndLimit(query);
        if (orderByAndLimit) {
            sql += ` ${orderByAndLimit}`;
        }

        return sql;
    }

    getColumn (column) {
        if (column.isCustom) {
            return column.viewExpression.replace(/#([a-z0-9_]+)/g, (match, elementID) => {
                let element;
                for (const collection of this.query.layer.params.schema) {
                    const el = collection.elements.find(e => e.elementID === elementID);
                    if (el !== undefined) {
                        element = el;
                        break;
                    }
                }

                if (element === undefined) {
                    throw new Error('Error in custom expression, element not found: #' + elementID);
                }

                return this.quoteIdentifier(element.collectionID) + '.' + this.quoteIdentifier(element.elementName);
            });
        }

        return this.quoteIdentifier(column.collectionID) + '.' + this.quoteIdentifier(column.elementName);
    }

    getCollection (collection) {
        const tableExpr = collection.isSQL
            ? `(${collection.sqlQuery})`
            : this.quoteIdentifier(collection.collectionName);

        const alias = this.quoteIdentifier(collection.collectionID);

        return `${tableExpr} ${alias}`;
    }

    buildJoin (join) {
        let joinType = join.parentJoin.joinType;

        if (join.collection.collectionID === join.parentJoin.sourceCollectionID) {
            if (joinType === 'left') {
                joinType = 'right';
            } else if (joinType === 'right') {
                joinType = 'left';
            }
        }

        let sqlJoin;
        switch (joinType) {
        case 'left':
            sqlJoin = 'LEFT JOIN';
            break;

        case 'right':
            sqlJoin = 'RIGHT JOIN';
            break;

        default:
            sqlJoin = 'INNER JOIN';
            break;
        }

        const table = this.getCollection(join.collection);
        const source = this.quoteIdentifier(join.parentJoin.sourceCollectionID) + '.' +
            this.quoteIdentifier(join.parentJoin.sourceElementName);
        const target = this.quoteIdentifier(join.parentJoin.targetCollectionID) + '.' +
            this.quoteIdentifier(join.parentJoin.targetElementName);

        let sql = `${sqlJoin} ${table} ON (${source} = ${target})`;

        if (Array.isArray(join.joins)) {
            for (const childJoin of join.joins) {
                sql += ' ' + this.buildJoin(childJoin);
            }
        }

        return sql;
    }

    getTextFilter (filter) {
        const field = this.getColumn(filter);

        switch (filter.filterType) {
        case 'equal':
            return this.getSimpleCondition(field, '=', filter.criterion.text1);

        case 'diferentThan':
            return this.getSimpleCondition(field, '!=', filter.criterion.text1);

        case 'biggerThan':
            return this.getSimpleCondition(field, '>', filter.criterion.text1);

        case 'lessOrEqualThan':
            return this.getSimpleCondition(field, '<=', filter.criterion.text1);

        case 'biggerOrEqualThan':
            return this.getSimpleCondition(field, '>=', filter.criterion.text1);

        case 'lessThan':
            return this.getSimpleCondition(field, '<', filter.criterion.text1);

        case 'between':
            return this.getBetweenCondition(field, filter.criterion.text1, filter.criterion.text2);

        case 'notBetween':
            return this.getNotBetweenCondition(field, filter.criterion.text1, filter.criterion.text2);

        case 'contains':
            return this.getContainsCondition(field, filter.criterion.text1);

        case 'notContains':
            return this.getNotContainsCondition(field, filter.criterion.text1);

        case 'startWith':
            return this.getStartWithCondition(field, filter.criterion.text1);

        case 'notStartWith':
            return this.getNotStartWithCondition(field, filter.criterion.text1);

        case 'endsWith':
            return this.getEndsWithCondition(field, filter.criterion.text1);

        case 'notEndsWith':
            return this.getNotEndsWithCondition(field, filter.criterion.text1);

        case 'like':
            return this.getSimpleCondition(field, 'LIKE', filter.criterion.text1);

        case 'notLike':
            return this.getSimpleCondition(field, 'NOT LIKE', filter.criterion.text1);

        case 'null':
            return `${field} IS NULL`;

        case 'notNull':
            return `${field} IS NOT NULL`;

        case 'empty':
            return `TRIM(${field}) = ''`;

        case 'notEmpty':
            return `TRIM(${field}) != ''`;

        case 'in':
            return this.getInCondition(field, filter.criterion.textList);

        case 'notIn':
            return this.getNotInCondition(field, filter.criterion.textList);

        default:
            throw new Error('Invalid filter type: ' + filter.filterType);
        }
    }

    // NOTE: This is not valid for date-time values...
    // the equal always take the whole day without taking care about the time
    getDateFilter (filter) {
        const field = this.getColumn(filter);
        const date1 = filter.criterion && filter.criterion.text1 ? new Date(filter.criterion.text1) : null;
        const date2 = filter.criterion && filter.criterion.text2 ? new Date(filter.criterion.text2) : null;

        let sql;
        switch (filter.filterType) {
        case 'equal-pattern': {
            if (filter.criterion.datePattern) {
                const dates = dateHelper.getDatePatternBounds(filter.criterion.datePattern);
                sql = `(${field} >= ${this.escape(dates[0])} AND ${field} < ${this.escape(dates[1])})`;
            }
            break;
        }

        case 'diferentThan-pattern': {
            if (filter.criterion.datePattern) {
                const dates = dateHelper.getDatePatternBounds(filter.criterion.datePattern);
                sql = `(${field} < ${this.escape(dates[0])} OR ${field} >= ${this.escape(dates[1])})`;
            }
            break;
        }

        case 'biggerThan-pattern': {
            if (filter.criterion.datePattern) {
                const dates = dateHelper.getDatePatternBounds(filter.criterion.datePattern);
                sql = `${field} > ${this.escape(dates[1])}`;
            }
            break;
        }

        case 'biggerOrEqualThan-pattern': {
            if (filter.criterion.datePattern) {
                const dates = dateHelper.getDatePatternBounds(filter.criterion.datePattern);
                sql = `${field} >= ${this.escape(dates[0])}`;
            }
            break;
        }

        case 'lessThan-pattern': {
            if (filter.criterion.datePattern) {
                const dates = dateHelper.getDatePatternBounds(filter.criterion.datePattern);
                sql = `${field} < ${this.escape(dates[0])}`;
            }
            break;
        }

        case 'lessOrEqualThan-pattern': {
            if (filter.criterion.datePattern) {
                const dates = dateHelper.getDatePatternBounds(filter.criterion.datePattern);
                sql = `${field} <= ${this.escape(dates[1])}`;
            }
            break;
        }

        case 'null':
            sql = `${field} IS NULL`;
            break;

        case 'notNull':
            sql = `${field} IS NOT NULL`;
            break;

        case 'between':
            sql = this.getBetweenCondition(field, date1, date2);
            break;

        case 'notBetween':
            sql = this.getNotBetweenCondition(field, date1, date2);
            break;

        case 'equal':
            sql = this.getDateEqualCondition(field, date1);
            break;

        case 'diferentThan':
            sql = this.getDateNotEqualCondition(field, date1);
            break;

        case 'biggerThan':
            sql = this.getSimpleCondition(field, '>', date1);
            break;

        case 'biggerOrEqualThan':
            sql = this.getSimpleCondition(field, '>=', date1);
            break;

        case 'lessThan':
            sql = this.getSimpleCondition(field, '<', date1);
            break;

        case 'lessOrEqualThan':
            sql = this.getSimpleCondition(field, '<=', date1);
            break;

        default:
            throw new Error('Invalid filter type: ' + filter.filterType);
        }

        return sql;
    }

    getSimpleCondition (field, operator, operand) {
        if (operand) {
            return `${field} ${operator} ${this.escape(operand)}`;
        }
    }

    getBetweenCondition (field, operand1, operand2) {
        if (operand1 && operand2) {
            return `${field} BETWEEN ${this.escape(operand1)} AND ${this.escape(operand2)}`;
        } else if (operand1) {
            return `${field} >= ${this.escape(operand1)}`;
        } else if (operand2) {
            return `${field} <= ${this.escape(operand2)}`;
        }
    }

    getNotBetweenCondition (field, operand1, operand2) {
        if (operand1 && operand2) {
            return `${field} NOT BETWEEN ${this.escape(operand1)} AND ${this.escape(operand2)}`;
        } else if (operand1) {
            return `${field} < ${this.escape(operand1)}`;
        } else if (operand2) {
            return `${field} > ${this.escape(operand2)}`;
        }
    }

    getContainsCondition (field, operand) {
        if (operand) {
            return `${field} LIKE ${this.escape('%' + operand + '%')}`;
        }
    }

    getNotContainsCondition (field, operand) {
        if (operand) {
            return `${field} NOT LIKE ${this.escape('%' + operand + '%')}`;
        }
    }

    getStartWithCondition (field, operand) {
        if (operand) {
            return `${field} LIKE ${this.escape(operand + '%')}`;
        }
    }

    getNotStartWithCondition (field, operand) {
        if (operand) {
            return `${field} NOT LIKE ${this.escape(operand + '%')}`;
        }
    }

    getEndsWithCondition (field, operand) {
        if (operand) {
            return `${field} LIKE ${this.escape('%' + operand)}`;
        }
    }

    getNotEndsWithCondition (field, operand) {
        if (operand) {
            return `${field} NOT LIKE ${this.escape('%' + operand)}`;
        }
    }

    getInCondition (field, operand) {
        if (operand && Array.isArray(operand) && operand.length > 0) {
            return `${field} IN (${this.escape(operand)})`;
        }
    }

    getNotInCondition (field, operand) {
        if (operand && Array.isArray(operand) && operand.length > 0) {
            return `${field} NOT IN (${this.escape(operand)})`;
        }
    }

    getDateEqualCondition (field, date) {
        if (date) {
            const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            return `(${this.getSimpleCondition(field, '>=', date)} AND ${this.getSimpleCondition(field, '<', nextDay)})`;
        }
    }

    getDateNotEqualCondition (field, date) {
        if (date) {
            const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            return `(${this.getSimpleCondition(field, '<', date)} OR ${this.getSimpleCondition(field, '>=', nextDay)})`;
        }
    }

    formatDate (date) {
        const year = date.getFullYear().toString().padStart(4, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    getFilter (filter) {
        if (filter.elementType === 'date') {
            return this.getDateFilter(filter);
        }

        return this.getTextFilter(filter);
    }

    quote (string, quoteChar) {
        const q = quoteChar;
        const qq = q + q;

        return q + string.replace(new RegExp(q, 'g'), qq) + q;
    }

    quoteIdentifier (identifier) {
        return this.quote(identifier, '"');
    }

    quoteString (string) {
        return this.quote(string, "'");
    }

    escape (value) {
        if (value instanceof Date) {
            return this.quoteString(this.formatDate(value));
        }

        if (
            (typeof value === 'number' && !Number.isNaN(value)) ||
            (typeof value === 'bigint') ||
            (typeof value === 'boolean') ||
            (value instanceof Number && !Number.isNaN(value.valueOf()))
        ) {
            return value;
        }

        if (value === null || value === undefined) {
            return 'NULL';
        }

        if (Array.isArray(value)) {
            return value.map(v => this.escape(v)).join(',');
        }

        return this.quoteString(String(value));
    }
}

module.exports = SqlQueryBuilder;
