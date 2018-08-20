
exports.runQuery = async function (dataSource, query) {
    const queryText = generateQueryText(query);

    let dbController;
    switch (dataSource.type) {
    case 'MySQL': dbController = require('./mysql.js');
        break;
    case 'POSTGRE': dbController = require('./postgresql.js');
        break;
    case 'ORACLE': dbController = require('./oracle.js');
        break;
    case 'MSSQL': dbController = require('./mssql.js');
        break;
    case 'BIGQUERY': dbController = require('./bigQuery.js');
        break;
    case 'JDBC-ORACLE': dbController = require('./jdbc-oracle.js');
    }

    var db = new dbController.Db();

    const start = Date.now();

    function tempPromiseWrapper (f, x) {
        // temporary
        // Made so that this code can be written without promises without having to change the other db files.
        // Changing these files to use promises will be done in a later branch ( I'm trying to keep these branches atomic )
        return new Promise((resolve, reject) => {
            f(x, function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    await tempPromiseWrapper(db.connect.bind(db), dataSource.params[0].connection);

    let result;

    try {
        result = await tempPromiseWrapper(db.query.bind(db), queryText);
    } catch (err) {
        return {
            result: 0,
            msg: 'Invalid query syntax : \n' + queryText,
            sql: queryText
        };
    }

    const time = Date.now() - start;

    if (db.connection) {
        db.end();
    }

    formatResult(result.rows);

    return {
        result: 1,
        data: result.rows, // getFormatedResult(result),
        sql: queryText,
        time: time
    };
};

function generateQueryText (query) {
    var queryText = '';

    queryText += 'SELECT ';

    for (const i in query.columns) {
        if (i !== '0') {
            queryText += ', ';
        }
        const column = query.columns[i];
        queryText += getIdentifier(column);
        queryText += ' AS ';
        queryText += column.id;
        // for example : SUM([column.elementID]) as [column.id]
    }

    queryText += ' FROM ';

    queryText += generateTableQuery(query.joinTree);

    queryText += ' WSTmain ';

    if (query.filters.length > 0) {
        queryText += 'WHERE ';
        for (const i in query.filters) {
            queryText += getFilterText(query.filters[i], i !== '0');
        }
        queryText += ' ';
    }
    if (query.groupKeys.length > 0) {
        queryText += 'GROUP BY ';
        for (const i in query.groupKeys) {
            if (i !== '0') {
                queryText += ', ';
            }
            queryText += getIdentifier(query.groupKeys[i]);
        }
        queryText += ' ';
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

    if (query.order.length > 0) {
        queryText += 'ORDER BY ';
        for (let i = 0; i < query.order.length; i++) {
            if (i > 0) {
                queryText += ', ';
            }
            queryText += getIdentifier(query.order[i]);
            if (query.order[i].sortDesc) {
                queryText += ' DESC';
            } else {
                queryText += ' ASC';
            }
        }
        queryText += ' ';
    }

    queryText += 'LIMIT ';
    queryText += String(limit);
    queryText += ' OFFSET ';
    queryText += String(offset);

    return queryText;
}

function getIdentifier (column) {
    var name;

    if (column.isCustom) {
        name = column.expression;
    } else {
        name = column.elementID;
    }

    name = '(' + name + ')';

    switch (column.aggregation) {
    case 'sum':
        return 'SUM' + name;
    case 'avg':
        return 'AVG' + name;
    case 'min':
        return 'MIN' + name;
    case 'max':
        return 'MAX' + name;
    case 'count':
        return 'COUNT' + name;
    default:
        return name;
    }

    // TODO : handle dates
}

function generateTableQuery (joinTree) {
    var tableText = '';

    tableText += '( SELECT ';

    for (const i in joinTree.fetchFields) {
        if (i !== '0') {
            tableText += ', ';
        }
        const field = joinTree.fetchFields[i];
        tableText += field.collectionID + '.' + field.elementName + ' AS ' + field.elementID;
    }

    for (const field of joinTree.carryFields) {
        tableText += ', ' + field.elementID;
    }

    tableText += ' FROM ';

    if (joinTree.collection.isSQL) {
        tableText += '( ' + joinTree.collection.sqlQuery + ' )';
    } else {
        tableText += joinTree.collection.collectionName;
    }

    tableText += ' ';

    tableText += joinTree.collection.collectionID;

    for (const node of joinTree.joins) {
        tableText += ' JOIN ';
        tableText += generateTableQuery(node);
        tableText += ' ';
        tableText += node.collection.collectionID;

        var firstElementName;
        var secondElementID;

        if (node.parentJoin.sourceCollectionID === joinTree.collection.collectionID) {
            firstElementName = node.parentJoin.sourceElementName;
            secondElementID = node.parentJoin.targetElementID;
        } else {
            firstElementName = node.parentJoin.targetElementName;
            secondElementID = node.parentJoin.sourceElementID;
        }

        tableText += ' ON ';
        tableText += joinTree.collection.collectionID + '.' + firstElementName;
        tableText += ' = ';
        tableText += node.collection.collectionID + '.' + secondElementID;
    }

    tableText += ' )';

    return tableText;
}

function getFilterText (filter, notFirst) {
    var result = '';

    if (notFirst) {
        switch (filter.conditionType) {
        case 'and':
            result += ' AND ';
            break;
        case 'or':
            result += ' OR ';
            break;
        case 'andNot':
            result += ' AND NOT ';
            break;
        case 'orNot':
            result += ' AND NOT ';
            break;
        }
    }

    const numericalFilters = ['equal', 'diferentThan', 'biggerThan', 'notGreaterThan', 'biggerOrEqualThan', 'lessThan', 'lessOrEqualThan', 'between', 'notBetween'];

    var filterValue = filter.criterion.text1;
    var filterSecondValue = filter.criterion.text2;
    var filterValueList = filter.criterion.textList;

    var filterIdentifier = getIdentifier(filter);

    if (filter.elementType === 'date' && (numericalFilters + ['in', 'notIn']).indexOf(filter.filterType) >= 0) {
        return getDateFilterText(filterIdentifier, filter);
    }

    switch (filter.filterType) {
    case 'equal':
        result += filterIdentifier + ' = ' + filterValue;
        break;

    case 'diferentThan' :
        result += (filterIdentifier + ' <> ' + filterValue);
        break;

    case 'biggerThan':
        result += (filterIdentifier + ' > ' + filterValue);
        break;

    case 'notGreaterThan':
        result += (filterIdentifier + ' <= ' + filterValue);
        break;

    case 'biggerOrEqualThan':
        result += (filterIdentifier + ' >= ' + filterValue);
        break;

    case 'lessThan':
        result += (filterIdentifier + ' < ' + filterValue);
        break;

    case 'lessOrEqualThan':
        result += (filterIdentifier + ' <= ' + filterValue);
        break;

    case 'between':
        result += (filterIdentifier + ' BETWEEN ' + filterValue + ' AND ' + filterSecondValue);
        break;

    case 'notBetween':
        result += (filterIdentifier + ' NOT BETWEEN ' + filterValue + ' AND ' + filterSecondValue);
        break;

    case 'contains':
        result += (filterIdentifier + ' LIKE ' + '\'%' + filterValue + '%\'');
        break;

    case 'notContains':
        result += (filterIdentifier + ' NOT LIKE ' + '\'%' + filterValue + '%\'');
        break;

    case 'startWith':
        result += (filterIdentifier + ' LIKE ' + '\'' + filterValue + '%\'');
        break;

    case 'notStartWith':
        result += (filterIdentifier + ' NOT LIKE ' + '\'' + filterValue + '%\'');
        break;

    case 'endsWith':
        result += (filterIdentifier + ' LIKE ' + '\'%' + filterValue + '\'');
        break;

    case 'notEndsWith':
        result += (filterIdentifier + ' NOT LIKE ' + '\'%' + filterValue + '\'');
        break;

    case 'like':
        result += (filterIdentifier + ' LIKE ' + '\'%' + filterValue + '%\'');
        break;

    case 'notLike':
        result += (filterIdentifier + ' NOT LIKE ' + '\'%' + filterValue + '%\'');
        break;

    case 'null':
        result += (filterIdentifier + ' IS NULL ');
        break;

    case 'notNull':
        result += (filterIdentifier + ' IS NOT NULL ');
        break;

    case 'in':
        result += (filterIdentifier + ' IN ' + filterValueList);
        break;
    case 'notIn':
        result += (filterIdentifier + ' NOT IN ' + filterValueList);
        break;
    default:
        break;
    }

    return result;
}

function getDateFilterText (filterIdentifier, filter) {
    // NOTE:This is not valid for date-time values... the equal always take the whole day without taking care about the time

    function pad (value) {
        return String(value).padStart(2, '0');
    }

    var today = new Date();
    var year = today.getFullYear();
    var month = pad(today.getMonth() + 1);
    var day = pad(today.getDate());

    let firstDate;
    let lastDate;

    const patterns = [];

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
            return '';
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
            return '(' + filterIdentifier + " >= '" + queryFirstDate + "' AND " + filterIdentifier + " < '" + queryLastDate + "')";

        case 'diferentThan-pattern':
            return '(' + filterIdentifier + " < '" + queryFirstDate + "' OR " + filterIdentifier + " >= '" + queryLastDate + "')";

        case 'biggerThan-pattern':
            return '(' + filterIdentifier + " > '" + queryLastDate + "')";

        case 'biggerOrEqualThan-pattern':
            return '(' + filterIdentifier + " >= '" + queryFirstDate + "')";

        case 'lessThan-pattern':
            return '(' + filterIdentifier + " < '" + queryFirstDate + "')";

        case 'lessOrEqualThan-pattern':
            return '(' + filterIdentifier + " <= '" + queryLastDate + "')";
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
            return '(' + filterIdentifier + " >= '" + querySearchDate + "' AND " + filterIdentifier + " < '" + querySearchDate2 + "')";

        case 'diferentThan':
            return '(' + filterIdentifier + " < '" + querySearchDate + "' OR " + filterIdentifier + " >= '" + querySearchDate2 + "')";

        case 'biggerThan':
            return filterIdentifier + " > '" + querySearchDate + "'";

        case 'notGreaterThan':
            return filterIdentifier + " <= '" + querySearchDate + "'";

        case 'biggerOrEqualThan':
            return filterIdentifier + " >= '" + querySearchDate + "'";

        case 'lessThan':
            return filterIdentifier + " < '" + querySearchDate + "'";

        case 'lessOrEqualThan':
            return filterIdentifier + " <= '" + querySearchDate + "'";

        case 'between':
            return filterIdentifier + " > '" + querySearchDate + "' AND " + filterIdentifier + " <= '" + queryLastDate + "'";

        case 'notBetween':
            return filterIdentifier + " < '" + querySearchDate + "' OR " + filterIdentifier + " > '" + queryLastDate + "'";

        case 'in':
        case 'notIn':
            var theFilter = filterIdentifier;
            if (filter.filterType === 'in') { theFilter = theFilter + ' IN ('; }
            if (filter.filterType === 'notIn') { theFilter = theFilter + ' NOT IN ('; }

            var dates = filter.criterion.dateList;
            for (var d in dates) {
                var theDate = new Date(dates[d]);
                var Inyear = theDate.getFullYear();
                var Inmonth = pad(theDate.getMonth() + 1);
                var Inday = pad(theDate.getDate());
                var InquerySearchDate = Inyear + '/' + Inmonth + '/' + Inday;

                theFilter = theFilter + "'" + InquerySearchDate + "'";
                if (d < dates.length - 1) { theFilter = theFilter + ', '; }
            }
        }

        return theFilter + ')';
    }
}

function formatResult (columns, rows) {
    var moment = require('moment');

    for (var r in rows) {
        const row = rows[r];
        for (var col of columns) {
            if (col.elementType === 'date' && col.format) {
                if (row[col.id]) {
                    row[col.id + '_original'] = row[col.id];
                    var date = new Date(row[col.id]);
                    row[col.id] = moment(date).format(col.format);
                }
            }
        }
    }
}
