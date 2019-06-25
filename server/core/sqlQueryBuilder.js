class SqlQueryBuilder {
    constructor (knex) {
        this.knex = knex;
    }

    build (query) {
        this.query = query;
        const sqb = this;
        const qb = this.knex.select().from(function () {
            const qb = this.from(sqb.getTable(query.joinTree.collection));
            for (const join of query.joinTree.joins) {
                sqb.buildJoin(qb, join);
            }

            const columns = query.columns.concat(query.order).reduce((acc, col) => {
                acc[col.elementID] = sqb.getRef(col);
                return acc;
            }, {});
            qb.select(columns);

            for (const i in query.filters) {
                const filter = query.filters[i];
                if (filter.elementType === 'date') {
                    sqb.applyDateFilter(qb, filter, i === '0');
                } else {
                    sqb.applyFilter(qb, filter, i === '0');
                }
            }

            if (query.quickResultLimit) {
                qb.limit(query.quickResultLimit);
            }

            qb.as('sub');
        });

        const aggregations = ['sum', 'avg', 'min', 'max', 'count', 'countDistinct'];
        for (const column of query.columns) {
            const c = { [column.id]: column.elementID };
            const f = aggregations.includes(column.aggregation)
                ? column.aggregation
                : 'select';

            qb[f](c);
        }

        for (const column of query.groupKeys) {
            qb.groupBy(column.elementID);
        }

        for (const order of query.order) {
            const direction = order.sortDesc ? 'desc' : 'asc';
            qb.orderBy(order.id, direction);

            // If there is a GROUP BY clause, it should contain all columns
            // used in the ORDER BY clause.
            // https://dev.mysql.com/doc/refman/5.7/en/group-by-handling.html
            if (query.groupKeys.length > 0 && !query.groupKeys.some(e => e.elementID === order.elementID)) {
                if (!order.aggregation) {
                    qb.groupBy(order.elementID);
                }
            }
        }

        if (query.recordLimit) {
            qb.limit(query.recordLimit);
        }

        return qb;
    }

    getRef (column) {
        let ref;

        if (column.isCustom) {
            const args = [];
            const expr = column.viewExpression.replace(/#([a-z0-9]+)/g, (match, elementID) => {
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

                args.push(element.collectionID + '.' + element.elementName);
                return '??';
            });
            ref = this.knex.raw(expr, args);
        } else {
            ref = this.knex.ref(column.collectionID + '.' + column.elementName);
        }

        return ref;
    }

    getTable (collection) {
        let tableExpr;
        if (collection.isSQL) {
            tableExpr = this.knex.raw('(' + collection.sqlQuery + ')');
        } else {
            tableExpr = collection.collectionName;
        }

        const table = {
            [collection.collectionID]: tableExpr,
        };

        return table;
    }

    buildJoin (qb, join) {
        let joinType = join.parentJoin.joinType;

        if (join.collection.collectionID === join.parentJoin.sourceCollectionID) {
            if (joinType === 'left') {
                joinType = 'right';
            } else if (joinType === 'right') {
                joinType = 'left';
            }
        }

        let joinFunc;
        switch (joinType) {
        case 'left':
            joinFunc = qb.leftJoin;
            break;

        case 'right':
            joinFunc = qb.rightJoin;
            break;

        default:
            joinFunc = qb.innerJoin;
            break;
        }

        joinFunc.call(qb, this.getTable(join.collection),
            join.parentJoin.sourceCollectionID + '.' + join.parentJoin.sourceElementName,
            join.parentJoin.targetCollectionID + '.' + join.parentJoin.targetElementName);

        for (const childJoin of join.joins) {
            this.buildJoin(qb, childJoin);
        }
    }

    applyFilter (qb, filter, first) {
        var field = this.getRef(filter);

        function applyWhere (condition, negate, value) {
            if (!value) {
                value = filter.criterion.text1;
            }
            if (first) {
                if (negate) {
                    return qb.whereNot(field, condition, value);
                } else {
                    return qb.where(field, condition, value);
                }
            } else {
                var ct = filter.conditionType;
                if (negate) {
                    ct = (ct === 'and' || ct === 'andNot') ? ((ct === 'and') ? 'andNot' : 'and') : ((ct === 'or') ? 'orNot' : 'or');
                }
                switch (ct) {
                case 'and':
                    return qb.where(field, condition, value);
                case 'or':
                    return qb.orWhere(field, condition, value);
                case 'andNot':
                    return qb.whereNot(field, condition, value);
                case 'orNot':
                    return qb.orWhereNot(field, condition, value);
                }
            }
        }

        function applyWhereBetween (negate) {
            if (first) {
                if (negate) {
                    return qb.whereNotBetween(field, [filter.criterion.text1, filter.criterion.text2]);
                } else {
                    return qb.whereBetween(field, [filter.criterion.text1, filter.criterion.text2]);
                }
            } else {
                var ct = filter.conditionType;
                if (negate) {
                    ct = (ct === 'and' || ct === 'andNot') ? ((ct === 'and') ? 'andNot' : 'and') : ((ct === 'or') ? 'orNot' : 'or');
                }
                switch (ct) {
                case 'and':
                    return qb.whereBetween(field, [filter.criterion.text1, filter.criterion.text2]);
                case 'or':
                    return qb.orWhereBetween(field, [filter.criterion.text1, filter.criterion.text2]);
                case 'andNot':
                    return qb.whereNotBetween(field, [filter.criterion.text1, filter.criterion.text2]);
                case 'orNot':
                    return qb.orWhereNotBetween(field, [filter.criterion.text1, filter.criterion.text2]);
                }
            }
        }

        function applyWhereIn (negate) {
            if (first) {
                if (negate) {
                    return qb.whereNotIn(field, filter.criterion.textList);
                } else {
                    return qb.whereIn(field, filter.criterion.textList);
                }
            } else {
                var ct = filter.conditionType;
                if (negate) {
                    ct = (ct === 'and' || ct === 'andNot') ? ((ct === 'and') ? 'andNot' : 'and') : ((ct === 'or') ? 'orNot' : 'or');
                }
                switch (ct) {
                case 'and':
                    return qb.whereIn(field, filter.criterion.textList);
                case 'or':
                    return qb.orWhereIn(field, filter.criterion.textList);
                case 'andNot':
                    return qb.whereNotIn(field, filter.criterion.textList);
                case 'orNot':
                    return qb.orWhereNotIn(field, filter.criterion.textList);
                }
            }
        }

        function applyWhereNull (negate) {
            if (first) {
                if (negate) {
                    return qb.whereNotNull(field);
                } else {
                    return qb.whereNull(field);
                }
            } else {
                var ct = filter.conditionType;
                if (negate) {
                    ct = (ct === 'and' || ct === 'andNot') ? ((ct === 'and') ? 'andNot' : 'and') : ((ct === 'or') ? 'orNot' : 'or');
                }
                switch (ct) {
                case 'and':
                    return qb.whereNull(field);
                case 'or':
                    return qb.orWhereNull(field);
                case 'andNot':
                    return qb.whereNotNull(field);
                case 'orNot':
                    return qb.orWhereNotNull(field);
                }
            }
        }

        switch (filter.filterType) {
        case 'equal':
            return applyWhere('=');

        case 'diferentThan' :
            return applyWhere('!=');

        case 'biggerThan':
            return applyWhere('>');

        case 'notGreaterThan':
            return applyWhere('>', true);

        case 'lessOrEqualThan':
            return applyWhere('<=');

        case 'biggerOrEqualThan':
            return applyWhere('>=');

        case 'lessThan':
            return applyWhere('<');

        case 'between':
            return applyWhereBetween(false);

        case 'notBetween':
            return applyWhereBetween(true);

        case 'contains':
            return applyWhere('like', false, '%' + filter.criterion.text1 + '%');

        case 'notContains':
            return applyWhere('like', true, '%' + filter.criterion.text1 + '%');

        case 'startWith':
            return applyWhere('like', false, filter.criterion.text1 + '%');

        case 'notStartWith':
            return applyWhere('like', true, filter.criterion.text1 + '%');

        case 'endsWith':
            return applyWhere('like', false, '%' + filter.criterion.text1);

        case 'notEndsWith':
            return applyWhere('like', true, '%' + filter.criterion.text1);

        case 'like':
            return applyWhere('like', false, filter.criterion.text1);

        case 'notLike':
            return applyWhere('like', true, filter.criterion.text1);

        case 'null':
            return applyWhereNull(false);

        case 'notNull':
            return applyWhereNull(true);

        case 'in':
            return applyWhereIn(false);

        case 'notIn':
            return applyWhereIn(true);

        default:
            return qb;
        }
    }

    applyDateFilter (qb, filter, first) {
        // NOTE: This is not valid for date-time values...
        // the equal always take the whole day without taking care about the time

        function applyWhereBuilder (builderFunction) {
            if (first) {
                return qb.where(builderFunction);
            } else {
                switch (filter.conditionType) {
                case 'and':
                    return qb.where(builderFunction);
                case 'or':
                    return qb.orWhere(builderFunction);
                case 'andNot':
                    return qb.whereNot(builderFunction);
                case 'orNot':
                    return qb.orWhereNot(builderFunction);
                default :
                    throw new Error('Invalid logical condition');
                }
            }
        }

        function pad (value) {
            return String(value).padStart(2, '0');
        }

        var today = new Date();
        var year = today.getFullYear();
        var month = pad(today.getMonth() + 1);
        var day = pad(today.getDate());

        let firstDate;
        let lastDate;

        const patterns = ['equal-pattern', 'diferentThan-pattern', 'biggerThan-pattern',
            'biggerOrEqualThan-pattern', 'lessThan-pattern', 'lessOrEqualThan-pattern'];

        if (patterns.indexOf(filter.filterType) >= 0) {
            let year1;
            let month1;
            let day1;
            let curr;
            let first;
            let last;
            let lwday;

            switch (filter.criterion.datePattern) {
            case '#WST-TODAY#':
                firstDate = new Date(year + '-' + month + '-' + day + 'T00:00:00.000Z');
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                year1 = tomorrow.getFullYear();
                month1 = pad(tomorrow.getMonth() + 1);
                day1 = pad(tomorrow.getDate());

                lastDate = new Date(year1 + '-' + month1 + '-' + day1 + 'T00:00:00.000Z');
                break;

            case '#WST-YESTERDAY#':
                lastDate = new Date(year + '-' + month + '-' + day + 'T00:00:00.000Z');
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                year1 = yesterday.getFullYear();
                month1 = pad(yesterday.getMonth() + 1);
                day1 = pad(yesterday.getDate());

                firstDate = new Date(year1 + '-' + month1 + '-' + day1 + 'T00:00:00.000Z');
                break;

            case '#WST-THISWEEK#': // TODO: first day monday instead sunday
                curr = new Date(); // get current date
                curr.setHours(0, 0, 0, 0);
                first = curr.getDate() - (curr.getDay() - 1); // First day is the day of the month - the day of the week
                last = first + 7; // last day is the first day + 6 one more day 7 because is a less than

                firstDate = new Date(curr.setDate(first));
                lastDate = new Date(curr.setDate(last));
                break;

            case '#WST-LASTWEEK#': // TODO: first day monday instead sunday
                curr = new Date(); // get current date
                curr.setHours(0, 0, 0, 0);
                lwday = new Date(curr);
                lwday.setDate(curr.getDate() - 7);

                first = lwday.getDate() - (lwday.getDay() - 1); // First day is the day of the month - the day of the week
                last = first + 7; // last day is the first day + 6 one more day 7 because is a less than

                firstDate = new Date(curr.setDate(first));
                lastDate = new Date(curr.setDate(last));
                break;

            case '#WST-THISMONTH#':
                firstDate = new Date(year + '-' + month + '-01T00:00:00.000Z');

                if (month === 12) {
                    lastDate = new Date((year + 1) + '-01-01T00:00:00.000Z');
                } else {
                    month1 = pad(today.getMonth() + 2);
                    lastDate = new Date(year + '-' + month1 + '-01T00:00:00.000Z');
                }
                break;

            case '#WST-LASTMONTH#':
                if (month === 1) {
                    firstDate = new Date((year - 1) + '-12-01T00:00:00.000Z');
                } else {
                    month1 = pad(today.getMonth());
                    firstDate = new Date(year + '-' + month1 + '-01T00:00:00.000Z');
                }

                lastDate = new Date(year + '-' + month + '-01T00:00:00.000Z');
                break;

            case '#WST-THISYEAR#':
                firstDate = new Date(year + '-01-01T00:00:00.000Z');
                lastDate = new Date((year + 1) + '-01-01T00:00:00.000Z');
                break;

            case '#WST-LASTYEAR#':
                firstDate = new Date((year - 1) + '-01-01T00:00:00.000Z');
                lastDate = new Date((year) + '-01-01T00:00:00.000Z');
                break;

            case '#WST-FIRSTQUARTER#':
                firstDate = new Date(year + '-01-01T00:00:00.000Z');
                lastDate = new Date(year + '-04-01T00:00:00.000Z');
                break;

            case '#WST-SECONDQUARTER#':
                firstDate = new Date(year + '-04-01T00:00:00.000Z');
                lastDate = new Date(year + '-07-01T00:00:00.000Z');
                break;

            case '#WST-THIRDQUARTER#':
                firstDate = new Date(year + '-07-01T00:00:00.000Z');
                lastDate = new Date(year + '-10-01T00:00:00.000Z');
                break;

            case '#WST-FOURTHQUARTER#':
                firstDate = new Date(year + '-10-01T00:00:00.000Z');
                lastDate = new Date((year + 1) + '-01-01T00:00:00.000Z');
                break;

            case '#WST-FIRSTSEMESTER#':
                firstDate = new Date(year + '-01-01T00:00:00.000Z');
                lastDate = new Date(year + '-07-01T00:00:00.000Z');
                break;

            case '#WST-SECONDSEMESTER#':
                firstDate = new Date(year + '-07-01T00:00:00.000Z');
                lastDate = new Date((year + 1) + '-01-01T00:00:00.000Z');
                break;

            case '#WST-LYFIRSTQUARTER#':
                firstDate = new Date((year - 1) + '-01-01T00:00:00.000Z');
                lastDate = new Date((year - 1) + '-04-01T00:00:00.000Z');
                break;

            case '#WST-LYSECONDQUARTER#':
                firstDate = new Date((year - 1) + '-04-01T00:00:00.000Z');
                lastDate = new Date((year - 1) + '-07-01T00:00:00.000Z');
                break;

            case '#WST-LYTHIRDQUARTER#':
                firstDate = new Date((year - 1) + '-07-01T00:00:00.000Z');
                lastDate = new Date((year - 1) + '-10-01T00:00:00.000Z');
                break;

            case '#WST-LYFOURTHQUARTER#':
                firstDate = new Date((year - 1) + '-10-01T00:00:00.000Z');
                lastDate = new Date(year + '-01-01T00:00:00.000Z');
                break;

            case '#WST-LYFIRSTSEMESTER#':
                firstDate = new Date((year - 1) + '-01-01T00:00:00.000Z');
                lastDate = new Date((year - 1) + '-07-01T00:00:00.000Z');
                break;

            case '#WST-LYSECONDSEMESTER#':
                firstDate = new Date((year - 1) + '-07-01T00:00:00.000Z');
                lastDate = new Date(year + '-01-01T00:00:00.000Z');
                break;

            default:
                throw new Error('unknown pattern');
            }

            const fyear = firstDate.getFullYear();
            const fmonth = pad(firstDate.getMonth() + 1);
            const fday = pad(firstDate.getDate());
            const lyear = lastDate.getFullYear();
            const lmonth = pad(lastDate.getMonth() + 1);
            const lday = pad(lastDate.getDate());

            const queryFirstDate = fyear + '/' + fmonth + '/' + fday;
            const queryLastDate = lyear + '/' + lmonth + '/' + lday;

            switch (filter.filterType) {
            case 'equal-pattern':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '>=', queryFirstDate);
                    builder.where(this.getRef(filter), '<', queryLastDate);
                });

            case 'diferentThan-pattern':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '<', queryFirstDate);
                    builder.orWhere(this.getRef(filter), '>=', queryLastDate);
                });

            case 'biggerThan-pattern':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '>', queryLastDate);
                });

            case 'biggerOrEqualThan-pattern':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '>=', queryFirstDate);
                });

            case 'lessThan-pattern':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '<', queryFirstDate);
                });

            case 'lessOrEqualThan-pattern':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '<=', queryLastDate);
                });
            }
        } else {
            const searchDate = new Date(filter.criterion.date1);
            const theNextDay = new Date(searchDate);

            theNextDay.setDate(searchDate.getDate() + 1);
            const qyear = searchDate.getFullYear();
            const qmonth = pad(searchDate.getMonth() + 1);
            const qday = pad(searchDate.getDate());

            const qyear2 = theNextDay.getFullYear();
            const qmonth2 = pad(theNextDay.getMonth() + 1);
            const qday2 = pad(theNextDay.getDate());

            let queryLastDate;
            if (filter.criterion.date2) {
                lastDate = new Date(filter.criterion.filterText2);
                const qlyear = lastDate.getFullYear();
                const qlmonth = pad(lastDate.getMonth() + 1);
                const qlday = pad(lastDate.getDate());
                queryLastDate = qlyear + '/' + qlmonth + '/' + qlday;
            }

            const querySearchDate = qyear + '/' + qmonth + '/' + qday;

            const querySearchDate2 = qyear2 + '/' + qmonth2 + '/' + qday2;

            switch (filter.filterType) {
            case 'equal':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '>=', querySearchDate);
                    builder.where(this.getRef(filter), '<', querySearchDate2);
                });

            case 'diferentThan':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '<', querySearchDate);
                    builder.orWhere(this.getRef(filter), '>=', querySearchDate2);
                });

            case 'biggerThan':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '>', querySearchDate);
                });

            case 'notGreaterThan':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '<=', querySearchDate);
                });

            case 'biggerOrEqualThan':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '>=', querySearchDate);
                });

            case 'lessThan':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '<', querySearchDate);
                });

            case 'lessOrEqualThan':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '<=', querySearchDate);
                });

            case 'between':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '>', querySearchDate);
                    builder.where(this.getRef(filter), '<=', queryLastDate);
                });

            case 'notBetween':
                return applyWhereBuilder(builder => {
                    builder.where(this.getRef(filter), '<', querySearchDate);
                    builder.orWhere(this.getRef(filter), '>', queryLastDate);
                });
            }
        }

        throw new Error('Invalid filter type : ' + filter.filterType);
    }
}

module.exports = SqlQueryBuilder;
