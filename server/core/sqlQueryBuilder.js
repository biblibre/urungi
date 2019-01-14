exports.build = function (query) {
    return function (knex) {
        const qb = knex(getTable(knex, query.joinTree.collection));
        for (const join of query.joinTree.joins) {
            buildJoin(knex, qb, join);
        }

        const aggregations = ['sum', 'avg', 'min', 'max', 'count'];
        for (const column of query.columns) {
            const c = {
                [column.id]: getRef(knex, column),
            };

            if (aggregations.includes(column.aggregation)) {
                qb[column.aggregation](c);
            } else {
                qb.select(c);
            }
        }

        for (const i in query.filters) {
            const filter = query.filters[i];
            if (filter.elementType === 'date') {
                applyDateFilter(knex, qb, filter, i === '0');
            } else {
                applyFilter(knex, qb, filter, i === '0');
            }
        }

        for (const column of query.groupKeys) {
            qb.groupBy(getRef(knex, column));
        }

        for (const order of query.order) {
            if (order.sortDesc) {
                qb.orderBy(getRef(knex, order), 'desc');
            } else {
                qb.orderBy(getRef(knex, order), 'asc');
            }

            // If there is a GROUP BY clause, it should contain all columns
            // used in the ORDER BY clause.
            // https://dev.mysql.com/doc/refman/5.7/en/group-by-handling.html
            if (query.groupKeys.length > 0 && !query.groupKeys.some(e => e.elementID === order.elementID)) {
                qb.groupBy(getRef(knex, order));
            }
        }

        var packetSize = 500;

        var offset = packetSize * (query.page - 1); // pages start at 1
        var limit;

        if (query.recordLimit) {
            limit = Math.min(query.recordLimit - offset, packetSize);
        } else {
            limit = packetSize;
        }

        if (limit < 0) {
            limit = 0;
        }

        qb.limit(limit).offset(offset);

        return qb;
    };
};

function getRef (knex, column) {
    let ref;

    if (column.isCustom) {
        const args = [];
        const expr = column.viewExpression.replace(/#([a-z0-9]+)/g, function (match, p1) {
            const arg = column.arguments.find(a => a.elementID === p1);
            args.push(arg.collectionID + '.' + arg.elementName);
            return '??';
        });
        ref = knex.raw(expr, args);
    } else {
        ref = knex.ref(column.collectionID + '.' + column.elementName);
    }

    return ref;
}

function getTable (knex, collection) {
    let tableExpr;
    if (collection.isSQL) {
        tableExpr = knex.raw('(' + collection.sqlQuery + ')');
    } else {
        tableExpr = collection.collectionName;
    }

    const table = {
        [collection.collectionID]: tableExpr,
    };

    return table;
}

function buildJoin (knex, qb, join) {
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

    joinFunc.call(qb, getTable(knex, join.collection),
        join.parentJoin.sourceCollectionID + '.' + join.parentJoin.sourceElementName,
        join.parentJoin.targetCollectionID + '.' + join.parentJoin.targetElementName);

    for (const childJoin of join.joins) {
        buildJoin(knex, qb, childJoin);
    }
}

function applyFilter (knex, qb, filter, first) {
    var field = getRef(knex, filter);

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

function applyDateFilter (knex, qb, filter, first) {
    // NOTE:This is not valid for date-time values... the equal always take the whole day without taking care about the time

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
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '>=', queryFirstDate);
                builder.where(getRef(knex, filter), '<', queryLastDate);
            });

        case 'diferentThan-pattern':
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '<', queryFirstDate);
                builder.orWhere(getRef(knex, filter), '>=', queryLastDate);
            });

        case 'biggerThan-pattern':
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '>', queryLastDate);
            });

        case 'biggerOrEqualThan-pattern':
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '>=', queryFirstDate);
            });

        case 'lessThan-pattern':
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '<', queryFirstDate);
            });

        case 'lessOrEqualThan-pattern':
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '<=', queryLastDate);
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
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '>=', querySearchDate);
                builder.where(getRef(knex, filter), '<', querySearchDate2);
            });

        case 'diferentThan':
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '<', querySearchDate);
                builder.orWhere(getRef(knex, filter), '>=', querySearchDate2);
            });

        case 'biggerThan':
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '>', querySearchDate);
            });

        case 'notGreaterThan':
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '<=', querySearchDate);
            });

        case 'biggerOrEqualThan':
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '>=', querySearchDate);
            });

        case 'lessThan':
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '<', querySearchDate);
            });

        case 'lessOrEqualThan':
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '<=', querySearchDate);
            });

        case 'between':
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '>', querySearchDate);
                builder.where(getRef(knex, filter), '<=', queryLastDate);
            });

        case 'notBetween':
            return applyWhereBuilder(function (builder) {
                builder.where(getRef(knex, filter), '<', querySearchDate);
                builder.orWhere(getRef(knex, filter), '>', queryLastDate);
            });

        case 'in':
        case 'notIn':
            var dateList = filter.criterion.dateList;
            for (var date of filter.criterion.dateList) {
                var theDate = new Date(date);
                var Inyear = theDate.getFullYear();
                var Inmonth = pad(theDate.getMonth() + 1);
                var Inday = pad(theDate.getDate());
                var InquerySearchDate = Inyear + '/' + Inmonth + '/' + Inday;

                dateList.push(InquerySearchDate);
            }

            if (filter.filterType === 'in') {
                return applyWhereBuilder(function (builder) {
                    builder.whereIn(getRef(knex, filter), dateList);
                });
            }
            if (filter.filterType === 'notIn') {
                return applyWhereBuilder(function (builder) {
                    builder.whereNotIn(getRef(knex, filter), dateList);
                });
            }
        }
    }

    throw new Error('Invalid filter type : ' + filter.filterType);
}

exports.processData = function (query, data) {
    var moment = require('moment');

    for (var row of data) {
        for (var col of query.columns) {
            if (col.elementType === 'date' && col.format) {
                if (row[col.id]) {
                    row[col.id + '_original'] = row[col.id];
                    var date = new Date(row[col.id]);
                    row[col.id] = moment(date).format(col.format);
                }
            }
        }
    }
};
