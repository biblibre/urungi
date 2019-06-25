const debug = require('debug')('urungi:server');

function generateShortUID () {
    return ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
}

exports.getSchemas = function (data, setresult) {
    let db;
    switch (data.type) {
    case 'JDBC-ORACLE': db = 'jdbc-oracle';
        break;
    case 'BIGQUERY': db = 'bigQuery';
    }

    var dbController = require('./' + db + '.js');

    //    if (data.type === 'MySQL' || data.type === 'POSTGRE' || data.type === 'ORACLE' || data.type === 'MSSQL')
    //      {}

    db = new dbController.Db();

    db.connect(data, function (err, connection) {
        if (err) {
            console.log(data.type + ' default connection error: ', err);
            setresult({ result: 0, msg: 'Connection Error: ' + err });
            return console.error('Connection Error: ', err);
        }

        var collections = data.entities;

        // get schemas
        var schemas = [];
        var tables = [];
        var schemasTables = [];

        for (var i in collections) {
            let schema;
            let table;
            if (String(collections[i].name).indexOf('.') > -1) {
                var res = String(collections[i].name).split('.');
                schema = res[0];
                table = res[1];
            } else {
                schema = collections[i].table_schema;
                table = collections[i].name;
            }

            if (schemas.indexOf(schema) === -1) { schemas.push(schema); }
            if (tables.indexOf(table) === -1) { tables.push(table); }

            if (typeof schema !== 'undefined') {
                if (schemasTables.indexOf(schema + '.' + table) === -1) {
                    const stable = { name: schema + '.' + table, schema: schema, table: table };
                    schemasTables.push(stable);
                }
            } else {
                if (schemasTables.indexOf(table) === -1) {
                    const stable = { name: table, schema: schema, table: table };
                    schemasTables.push(stable);
                }
            }
        }

        var newSchemas = schemas.length === 0 ? '' : "'" + schemas.join("','") + "'";
        var newTables = tables.length === 0 ? '' : "'" + tables.join("','") + "'";

        var query = db.getSchemaQuery(newSchemas, newTables);

        /*
        *   SELECT table_schema, table_name, column_name, data_type
        *   FROM information_schema.columns
        *   WHERE table_schema in ( newSchemas )
        *   AND table_name in ( newTables )
        */

        db.query(query, function (err, result) {
            if (err) {
                setresult({ result: 0, msg: 'Error getting the element schemas : ' + err });
                console.log('Error getting the element schemas : ', err);
            } else {
                var schemas = [];

                if (result.rows) {
                    for (var s in schemasTables) {
                        getCollectionSchema(schemasTables[s], result.rows, function (resultCollection) {
                            schemas.push(resultCollection);
                        });
                    }
                }
                debug({ result: 1, items: schemas });
                setresult({ result: 1, items: schemas });
            }
            db.end();
        });
    });
};

exports.getSqlQuerySchema = function (data, setresult) {
    let db;
    switch (data.type) {
    case 'JDBC-ORACLE': db = 'jdbc-oracle';
        break;
    case 'BIGQUERY': db = 'bigQuery';
    }

    var dbController = require('./' + db + '.js');

    db = new dbController.Db();
    db.connect(data, function (err, connection) {
        if (err) {
            console.log(data.type + ' default connection error: ', err);
            setresult({ result: 0, msg: 'Connection Error: ' + err });
            return console.error('Connection Error: ', err);
        }

        var query = db.setLimitToSQL('SELECT * FROM (' + data.sqlQuery.sql + ') wst_q1 ', 1, 0);

        db.query(query, function (err, finalresult) {
            if (finalresult) {
                getSQLResultsSchema(data.sqlQuery.name, finalresult.rows, data.sqlQuery.sql, function (collection) {
                    var schemas = [];
                    schemas.push(collection);
                    debug({ result: 1, items: schemas });
                    setresult({ result: 1, items: schemas });
                });
            } else {
                setresult({ result: 0, msg: err });
            }
            db.end();
        });
    });
};

function getSQLResultsSchema (collectionRef, queryResults, sqlQuery, done) {
    var theCollection = {
        collectionName: collectionRef.collectionName,
        visible: true,
        collectionLabel: collectionRef.collectionName,
        isSQL: true,
        sqlQuery: sqlQuery
    };

    theCollection.elements = [];

    for (var key in queryResults[0]) {
        var name = key;
        var type = 'string';

        if (typeof (queryResults[0][key]) === 'number') {
            if (isNaN(queryResults[0][key]) === false) { type = 'number'; }
        }

        // TODO: type = 'date'; json type = object , NaN = false

        if (typeof (queryResults[0][key]) === 'boolean') { type = 'boolean'; }

        var elementID = 'wst' + generateShortUID();
        var isVisible = true;

        if (name !== 'wst_rnum') {
            theCollection.elements.push({ elementID: elementID, elementName: name, elementType: type, visible: isVisible, elementLabel: name });
        }
    }

    done(theCollection);
}

function getCollectionSchema (collection, queryResults, done) {
    var collectionName = collection.name;
    // var collectionID = 'WST' + generateShortUID();

    // collectionID = collectionID.replace(new RegExp('-', 'g'), '');
    var theCollection = { collectionName: collectionName, visible: true, collectionLabel: collectionName };
    theCollection.elements = [];

    for (var d = 0; d < queryResults.length; d++) {
        if (queryResults[d].table_schema === collection.schema && queryResults[d].table_name === collection.table) {
            var name = queryResults[d].column_name;
            var type = 'string';
            /* string, number, boolean, date,
             {name:"string",value:"string"},
             {name:"number",value:"number"},
             {name:"boolean",value:"boolean"},
             {name:"date",value:"date"}, */

            if (queryResults[d].data_type === 'smallint' ||
                queryResults[d].data_type === 'integer' ||
                queryResults[d].data_type === 'bigint' ||
                queryResults[d].data_type === 'number' ||
                queryResults[d].data_type === 'decimal' ||
                queryResults[d].data_type === 'numeric' ||
                queryResults[d].data_type === 'real' ||
                queryResults[d].data_type === 'double precision' ||
                queryResults[d].data_type === 'serial' ||
                queryResults[d].data_type === 'bigserial' ||
                queryResults[d].data_type === 'money') { type = 'number'; }

            if (queryResults[d].data_type === 'timestamp without time zone' ||
                queryResults[d].data_type === 'timestamp with time zone' ||
                queryResults[d].data_type === 'date' ||
                queryResults[d].data_type === 'time without time zone' ||
                queryResults[d].data_type === 'time with time zone' ||
                queryResults[d].data_type === 'abstime' ||
                queryResults[d].data_type === 'interval') { type = 'date'; }

            var dataType = queryResults[d].data_type;
            if (dataType) {
                if (dataType.indexOf('timestamp') > -1) { type = 'date'; }
            }

            if (queryResults[d].data_type === 'boolean') { type = 'boolean'; }

            // var elementID = generateShortUID();
            var isVisible = true;
            theCollection.elements.push({ elementName: name, elementType: type, visible: isVisible, elementLabel: name, data_type: queryResults[d].data_type });
        }
    }

    done(theCollection);
}

exports.generateQueryText = generateQueryText;

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

    var filterValue = escape(filter.criterion.text1);
    var filterSecondValue = escape(filter.criterion.text2);
    var filterValueList = escapeList(filter.criterion.textList);

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
        }
    }
}

function escape (value) {
    var escapedString = String(value);
    const dangerousCharacters = [ '\\', '\'', '"', '`', ';', '-' ];
    for (const c of dangerousCharacters) {
        escapedString = escapedString.replace(c, '\\' + c);
    }
    return '`' + escapedString + '`';
}

function escapeList (list) {
    var res = '';
    res += '( ';
    for (const i in list) {
        if (i !== '0') {
            res += ', ';
        }
        res += escape(list[i]);
    }
    res += ' )';
    return res;
}
