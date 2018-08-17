const debug = require('debug')('urungi:server');

exports.processCollections = function (req, query, collections, dataSource, params, thereAreJoins, done) {
    processCollections(req, query, collections, dataSource, params, thereAreJoins, done);
};

function generateShortUID () {
    return ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
}

exports.getSchemas = function (data, setresult) {
    let db;
    switch (data.type) {
    case 'MySQL': db = 'mysql';
        break;
    case 'POSTGRE': db = 'postgresql';
        break;
    case 'ORACLE': db = 'oracle';
        break;
    case 'MSSQL': db = 'mssql';
        break;
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
            setresult({result: 0, msg: 'Connection Error: ' + err});
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
                    const stable = {name: schema + '.' + table, schema: schema, table: table};
                    schemasTables.push(stable);
                }
            } else {
                if (schemasTables.indexOf(table) === -1) {
                    const stable = {name: table, schema: schema, table: table};
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
                setresult({result: 0, msg: 'Error getting the element schemas : ' + err});
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
                debug({result: 1, items: schemas});
                setresult({result: 1, items: schemas});
            }
            db.end();
        });
    });
};

exports.getSqlQuerySchema = function (data, setresult) {
    let db;
    switch (data.type) {
    case 'MySQL': db = 'mysql';
        break;
    case 'POSTGRE': db = 'postgresql';
        break;
    case 'ORACLE': db = 'oracle';
        break;
    case 'MSSQL': db = 'mssql';
        break;
    case 'JDBC-ORACLE': db = 'jdbc-oracle';
        break;
    case 'BIGQUERY': db = 'bigQuery';
    }

    var dbController = require('./' + db + '.js');

    db = new dbController.Db();
    db.connect(data, function (err, connection) {
        if (err) {
            console.log(data.type + ' default connection error: ', err);
            setresult({result: 0, msg: 'Connection Error: ' + err});
            return console.error('Connection Error: ', err);
        }

        var query = db.setLimitToSQL('SELECT * FROM (' + data.sqlQuery.sql + ') wst_q1 ', 1, 0);

        db.query(query, function (err, finalresult) {
            if (finalresult) {
                getSQLResultsSchema(data.sqlQuery.name, finalresult.rows, data.sqlQuery.sql, function (collection) {
                    var schemas = [];
                    schemas.push(collection);
                    debug({result: 1, items: schemas});
                    setresult({result: 1, items: schemas});
                });
            } else {
                setresult({result: 0, msg: err});
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
            theCollection.elements.push({elementID: elementID, elementName: name, elementType: type, visible: isVisible, elementLabel: name});
        }
    }

    done(theCollection);
}

function getCollectionSchema (collection, queryResults, done) {
    var collectionName = collection.name;
    // var collectionID = 'WST' + generateShortUID();

    // collectionID = collectionID.replace(new RegExp('-', 'g'), '');
    var theCollection = {collectionName: collectionName, visible: true, collectionLabel: collectionName};
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
            theCollection.elements.push({elementName: name, elementType: type, visible: isVisible, elementLabel: name, data_type: queryResults[d].data_type});
        }
    }

    done(theCollection);
}

function processCollections (req, query, collections, dataSource, params, thereAreJoins, setresult, index) {
    var from = [];
    var fields = [];
    var groupBy = [];
    var processedCollections = [];
    var elements = [];
    var leadTable = {};
    var leadTableJoinsCount = 0;
    if (collections.length === 1) {
        leadTable = collections[0];
    }

    for (const c in collections) {
        const table = collections[c];
        table.joinsCount = 0;

        for (const j in table.joins) {
            const join = table.joins[j];
            if (join.sourceCollectionID === table.collectionID) {
                table.joinsCount = table.joinsCount + 1;
            }

            if (join.targetCollectionID === table.collectionID) {
                table.joinsCount = table.joinsCount + 1;
            }
        }

        if (table.joinsCount > leadTableJoinsCount) {
            leadTable = table;
            leadTableJoinsCount = table.joinsCount;
        }
    }

    for (const c in collections) {
        const table = collections[c];
        var strJoin = '';

        for (var j in table.joins) {
            const join = table.joins[j];

            if (join.sourceCollectionID === table.collectionID) {
                if (join.joinType === 'default') { strJoin = ' INNER JOIN '; }

                processedCollections.push(join.targetCollectionID);

                strJoin = strJoin + join.targetCollectionName + ' ' + join.targetCollectionID + ' ON (';

                strJoin = strJoin + join.sourceCollectionID + '.' + join.sourceElementName + ' = ' + join.targetCollectionID + '.' + join.targetElementName;
                strJoin = strJoin + ')';
            }
        }

        if (processedCollections.indexOf(table.collectionID) === -1) {
            from.push(table.collectionName + ' ' + table.collectionID + strJoin);
        }

        processedCollections.push(table.collectionID);

        for (var e in table.columns) {
            var field = table.columns[e];
            elements.push(field);

            if (field.hidden !== true) {
                if (field.aggregation) {
                    switch (field.aggregation) {
                    case 'sum': fields.push('SUM(' + table.collectionID + '.' + field.elementName + ')' + ' as ' + field.id);
                        break;
                    case 'avg': fields.push('AVG(' + table.collectionID + '.' + field.elementName + ')' + ' as ' + field.id);
                        break;
                    case 'min': fields.push('MIN(' + table.collectionID + '.' + field.elementName + ')' + ' as ' + field.id);
                        break;
                    case 'max': fields.push('MAX(' + table.collectionID + '.' + field.elementName + ')' + ' as ' + field.id);
                        break;
                    case 'count': fields.push('COUNT(' + table.collectionID + '.' + field.elementName + ')' + ' as ' + field.id);
                    }
                } else {
                    fields.push(table.collectionID + '.' + field.elementName + ' as ' + field.id);
                    if (dataSource.type !== 'BIGQUERY') { groupBy.push(table.collectionID + '.' + field.elementName); } else { groupBy.push(field.id); }
                }
            }
        }
    }

    var SQLstring = 'SELECT ';

    SQLstring += fields.join(', ');

    if (leadTable.schema) {
        if (leadTable.schema.isSQL === true) {
            SQLstring = SQLstring + ' FROM (' + leadTable.schema.sqlQuery + ') ' + leadTable.collectionID + getJoins(leadTable.collectionID, collections, []);
        } else {
            SQLstring = SQLstring + ' FROM ' + leadTable.schema.collectionName + ' ' + leadTable.collectionID + getJoins(leadTable.collectionID, collections, []);
        }
    } else {
        if (leadTable.isSQL === true) {
            SQLstring = SQLstring + ' FROM (' + leadTable.sqlQuery + ') ' + leadTable.collectionID + getJoins(leadTable.collectionID, collections, []);
        } else {
            SQLstring = SQLstring + ' FROM ' + leadTable.collectionName + ' ' + leadTable.collectionID + getJoins(leadTable.collectionID, collections, []);
        }
    }

    var havings = [];
    getFilters(query, function (filtersResult, havingsResult) {
        if (filtersResult.length > 0) { SQLstring += ' WHERE '; }

        for (var fr in filtersResult) { SQLstring += filtersResult[fr]; }
        havings = havingsResult;

        if (groupBy.length > 0) {
            SQLstring += ' GROUP BY ';
            SQLstring += groupBy.join(', ');
        }

        if (havings.length > 0) { SQLstring += ' HAVING '; }

        for (var h in havings) { SQLstring += havings[h]; }

        if (query.order) {
            if (query.order.length > 0) {
                var theOrderByString = '';

                for (const f in query.order) {
                    var theOrderField = query.order[f];
                    var theOrderFieldName = '';

                    let theSortOrderFieldName;
                    if (theOrderField.aggregation) {
                        var AGG = theOrderField.aggregation.toUpperCase();

                        theSortOrderFieldName = AGG + '(' + theOrderField.collectionID + '.' + theOrderField.elementName + ')';
                        theOrderFieldName = theSortOrderFieldName + ' as ' + theOrderField.id;
                    } else {
                        theSortOrderFieldName = theOrderField.collectionID + '.' + theOrderField.elementName;
                        theOrderFieldName = theSortOrderFieldName + ' as ' + theOrderField.id;
                    }

                    var sortType = '';
                    if (query.order[f].sortType === 1) { sortType = ' DESC'; }

                    var theIndex = fields.indexOf(theOrderFieldName);

                    if (theIndex >= 0) {
                    // The order by field is in the result set
                        if (theOrderByString === '') {
                            theOrderByString += (theIndex + 1) + sortType;
                        } else {
                            theOrderByString += ', ' + (theIndex + 1) + sortType;
                        }
                    } else {
                        // No index, the field is not in the result set
                        if (theOrderByString === '') {
                            theOrderByString += theSortOrderFieldName + sortType;
                        } else {
                            theOrderByString += ', ' + theSortOrderFieldName + sortType;
                        }
                    }
                }

                console.log('order by string', theOrderByString);

                if (theOrderByString !== '') { SQLstring += ' ORDER BY ' + theOrderByString; }
            }
        }

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

        if (query.recordLimit) {
            if (query.recordLimit > 0) {
                SQLstring = db.setLimitToSQL(SQLstring, query.recordLimit, ((params.page - 1) * query.recordLimit));
            }
        } else {
            if (dataSource.packetSize) {
                if (dataSource.packetSize !== -1) { SQLstring = db.setLimitToSQL(SQLstring, dataSource.packetSize, ((params.page - 1) * dataSource.packetSize)); }
            } else {
                if (config.get('query.defaultRecordsPerPage') > 1) {
                    SQLstring = db.setLimitToSQL(SQLstring, config.get('query.defaultRecordsPerPage'), ((params.page - 1) * config.get('query.defaultRecordsPerPage')));
                }
            }
        }

        // Fix for filters with having and normal filters
        SQLstring = SQLstring.replace('WHERE  AND', 'WHERE');

        // console.log(SQLstring);

        if (dataSource.type !== 'BIGQUERY') {
            db.connect(dataSource.connection, function (err, connection) {
                if (err) {
                    setresult({result: 0, msg: 'Connection Error: ' + err});
                    return console.error('Connection Error: ', err);
                }

                const start = Date.now();
                db.query(SQLstring, function (err, result) {
                    if (err) {
                        setresult({result: 0, msg: 'Generated SQL Error: ' + SQLstring, sql: SQLstring});
                        saveToLog(req, 'SQL Error: ' + err + ' (' + SQLstring + ')', 300, 'SQL-002', 'QUERY: (' + JSON.stringify(query) + ')', undefined);
                    } else {
                        const time = Date.now() - start;

                        getFormatedResult(elements, result.rows, function (finalResults) {
                            setresult({result: 1, data: finalResults, sql: SQLstring, time: time});
                            if (result) {
                                saveToLog(req, SQLstring, 400, 'SQL-001', 'QUERY: (' + JSON.stringify(query) + ')', undefined);
                            }
                        });
                    }

                    db.end();
                });
            });
        } else {
            dataSource.connection.companyID = req.user.companyID;

            const start = Date.now();
            db.executeSQLQuery(dataSource.connection, SQLstring, function (result) {
                const time = Date.now() - start;

                getFormatedResult(elements, result, function (finalResults) {
                    setresult({result: 1, data: finalResults, sql: SQLstring, time: time});
                });
            });
        }
    });
}

function getFormatedResult (elementSchema, results, done) {
    var finalResults = [];
    var moment = require('moment');

    if (results) {
        for (var r in results) {
            for (var es in elementSchema) {
                var newRecord = {};

                if (elementSchema[es].elementType === 'date' && elementSchema[es].format) {
                    results[r][elementSchema[es].id + '_original'] = results[r][elementSchema[es].id];
                    if (results[r][elementSchema[es].id]) {
                        var date = new Date(results[r][elementSchema[es].id]);
                        results[r][elementSchema[es].id] = moment(date).format(elementSchema[es].format);
                    }
                }

                for (var f in results[r]) {
                    newRecord[f.toLowerCase()] = results[r][f];
                }
            }

            finalResults.push(newRecord);
        }
    }

    done(finalResults);
}

function getFilters (query, done) {
    var filters = [];
    var havings = [];

    for (var f in query.groupFilters) {
        var previousRelational = '';

        if (query.groupFilters[f].conditionLabel) {
            previousRelational = ' ' + query.groupFilters[f].conditionLabel + ' ';
        }

        var filterSQL = getFilterSQL(query.groupFilters[f]);

        if (filterSQL !== '') {
            if (!query.groupFilters[f].aggregation) {
                if (f > 0) { filterSQL = previousRelational + filterSQL; }

                filters.push(filterSQL);
            } else {
                if (havings.length > 0) { filterSQL = previousRelational + filterSQL; }

                havings.push(filterSQL);
            }
        }
    }

    done(filters, havings);
}

function getFilterSQL (filter, isHaving) {
    var result = '';

    const numericalFilters = ['equal', 'diferentThan', 'biggerThan', 'notGreaterThan', 'biggerOrEqualThan', 'lessThan', 'lessOrEqualThan', 'between', 'notBetween'];

    var filterValue = filter.criterion.text1;
    var filterSecondValue = filter.criterion.text2;
    var filterValueList = filter.criterion.textList;
    let filterElementName;

    if (!filter.aggregation) {
        filterElementName = filter.collectionID + '.' + filter.elementName;
    } else {
        filterElementName = filter.aggregation + '(' + filter.collectionID + '.' + filter.elementName + ')';
    }

    if (filter.elementType === 'date' && (numericalFilters + ['in', 'notIn']).indexOf(filter.filterType) >= 0) {
        return dateFilter(filterElementName, filter);
    }

    switch (filter.filterType) {
    case 'null':
    case 'notNull':
        break;
    case 'in':
    case 'notIn':
        if (!filterValueList.length) {
            return '';
        }
        break;
    case 'between':
    case 'notBetween':
        if (!(filterValue && filterSecondValue)) {
            return '';
        }
        break;
    default:
        if (!filterValue) {
            return '';
        }
    }

    if (filter.elementType === 'number') {
        if (filter.filterType !== 'in' && filter.filterType !== 'notIn') {
            filterValue = Number(filterValue);
        }
    }

    if (filter.elementType !== 'number' && numericalFilters.indexOf(filter.filterType) >= 0) {
        filterValue = '\'' + filterValue + '\'';
        if (filterSecondValue) {
            filterSecondValue = '\'' + filterSecondValue + '\'';
        }
    }

    switch (filter.filterType) {
    case 'equal':
        result = filterElementName + ' = ' + filterValue;
        break;

    case 'diferentThan' :
        result = (filterElementName + ' <> ' + filterValue);
        break;

    case 'biggerThan':
        result = (filterElementName + ' > ' + filterValue);
        break;

    case 'notGreaterThan':
        result = (filterElementName + ' <= ' + filterValue);
        break;

    case 'biggerOrEqualThan':
        result = (filterElementName + ' >= ' + filterValue);
        break;

    case 'lessThan':
        result = (filterElementName + ' < ' + filterValue);
        break;

    case 'lessOrEqualThan':
        result = (filterElementName + ' <= ' + filterValue);
        break;

    case 'between':
        result = (filterElementName + ' BETWEEN ' + filterValue + ' AND ' + filter.filterText2);
        break;

    case 'notBetween':
        result = (filterElementName + ' NOT BETWEEN ' + filterValue + ' AND ' + filter.filterText2);
        break;

    case 'contains':
        result = (filterElementName + ' LIKE ' + '\'%' + filterValue + '%\'');
        break;

    case 'notContains':
        result = (filterElementName + ' NOT LIKE ' + '\'%' + filterValue + '%\'');
        break;

    case 'startWith':
        result = (filterElementName + ' LIKE ' + '\'' + filterValue + '%\'');
        break;

    case 'notStartWith':
        result = (filterElementName + ' NOT LIKE ' + '\'' + filterValue + '%\'');
        break;

    case 'endsWith':
        result = (filterElementName + ' LIKE ' + '\'%' + filterValue + '\'');
        break;

    case 'notEndsWith':
        result = (filterElementName + ' NOT LIKE ' + '\'%' + filterValue + '\'');
        break;

    case 'like':
        result = (filterElementName + ' LIKE ' + '\'%' + filterValue + '%\'');
        break;

    case 'notLike':
        result = (filterElementName + ' NOT LIKE ' + '\'%' + filterValue + '%\'');
        break;

    case 'null':
        result = (filterElementName + ' IS NULL ');
        break;

    case 'notNull':
        result = (filterElementName + ' IS NOT NULL ');
        break;

    case 'in':
    case 'notIn':
        let filterSTR = '';
        for (const i in filterValueList) {
            if (i !== '0') {
                filterSTR += ', ';
            }
            if (filter.elementType === 'number') {
                filterSTR += filterValueList[i];
            } else {
                filterSTR += "'" + filterValueList[i] + "'";
            }
        }
        if (filter.filterType === 'in') {
            result = (filterElementName + ' IN ' + '(' + filterSTR + ')');
        } else {
            result = (filterElementName + ' NOT IN ' + '(' + filterSTR + ')');
        }
        break;

    default:
        break;
    }

    return result;
}

function getJoins (collectionID, collections, processedCollections) {
    var fromSQL = '';
    for (var c in collections) {
        if (collections[c].collectionID === collectionID && (processedCollections.indexOf(collectionID) === -1)) {
            var table = collections[c];
            processedCollections.push(collectionID);

            for (var j in table.joins) {
                var join = table.joins[j];

                if (join.sourceCollectionID === table.collectionID && (processedCollections.indexOf(join.targetCollectionID) === -1)) {
                    if (join.joinType === 'default') { fromSQL = fromSQL + ' INNER JOIN '; }
                    if (join.joinType === 'left') { fromSQL = fromSQL + ' LEFT JOIN '; }
                    if (join.joinType === 'right') { fromSQL = fromSQL + ' RIGHT JOIN '; }

                    fromSQL = fromSQL + join.targetCollectionName + ' ' + join.targetCollectionID;

                    fromSQL = fromSQL + ' ON (' + join.sourceCollectionID + '.' + join.sourceElementName + ' = ' + join.targetCollectionID + '.' + join.targetElementName + ')';
                    fromSQL = fromSQL + getJoins(join.targetCollectionID, collections, processedCollections);
                }

                if (join.targetCollectionID === table.collectionID && (processedCollections.indexOf(join.sourceCollectionID) === -1)) {
                    if (join.joinType === 'default') { fromSQL = fromSQL + ' INNER JOIN '; }
                    if (join.joinType === 'left') { fromSQL = fromSQL + ' LEFT JOIN '; }
                    if (join.joinType === 'right') { fromSQL = fromSQL + ' RIGHT JOIN '; }

                    fromSQL = fromSQL + join.sourceCollectionName + ' ' + join.sourceCollectionID;

                    fromSQL = fromSQL + ' ON (' + join.targetCollectionID + '.' + join.targetElementName + ' = ' + join.sourceCollectionID + '.' + join.sourceElementName + ')';

                    fromSQL = fromSQL + getJoins(join.sourceCollectionID, collections, processedCollections);
                }
            }
        }
    }

    return fromSQL;
}

function pad (num, size) {
    var s = num + '';
    while (s.length < size) s = '0' + s;
    while (s.length < size) s = '0' + s;
    return s;
}

function dateFilter (filterElementName, filter) {
    // NOTE:This is not valid for date-time values... the equal always take the whole day without taking care about the time

    var today = new Date();
    var year = today.getFullYear();
    var month = pad(today.getMonth() + 1, 2);
    var day = pad(today.getDate(), 2);

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
            month1 = pad(tomorrow.getMonth() + 1, 2);
            day1 = pad(tomorrow.getDate(), 2);

            lastDate = new Date(year1 + '-' + month1 + '-' + day1 + 'T00:00:00.000Z');
            break;

        case '#WST-YESTERDAY#':
            lastDate = new Date(year + '-' + month + '-' + day + 'T00:00:00.000Z');
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            year1 = yesterday.getFullYear();
            month1 = pad(yesterday.getMonth() + 1, 2);
            day1 = pad(yesterday.getDate(), 2);

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
                month1 = pad(today.getMonth() + 2, 2);
                lastDate = new Date(year + '-' + month1 + '-01T00:00:00.000Z');
            }
            break;

        case '#WST-LASTMONTH#':
            if (month === 1) {
                firstDate = new Date((year - 1) + '-12-01T00:00:00.000Z');
            } else {
                month1 = pad(today.getMonth(), 2);
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
        const fmonth = pad(firstDate.getMonth() + 1, 2);
        const fday = pad(firstDate.getDate(), 2);
        const lyear = lastDate.getFullYear();
        const lmonth = pad(lastDate.getMonth() + 1, 2);
        const lday = pad(lastDate.getDate(), 2);

        const queryFirstDate = fyear + '/' + fmonth + '/' + fday;
        const queryLastDate = lyear + '/' + lmonth + '/' + lday;

        switch (filter.filterType) {
        case 'equal-pattern':
            return '(' + filterElementName + " >= '" + queryFirstDate + "' AND " + filterElementName + " < '" + queryLastDate + "')";

        case 'diferentThan-pattern':
            return '(' + filterElementName + " < '" + queryFirstDate + "' OR " + filterElementName + " >= '" + queryLastDate + "')";

        case 'biggerThan-pattern':
            return '(' + filterElementName + " > '" + queryLastDate + "')";

        case 'biggerOrEqualThan-pattern':
            return '(' + filterElementName + " >= '" + queryFirstDate + "')";

        case 'lessThan-pattern':
            return '(' + filterElementName + " < '" + queryFirstDate + "')";

        case 'lessOrEqualThan-pattern':
            return '(' + filterElementName + " <= '" + queryLastDate + "')";
        }
    } else {
        const searchDate = new Date(filter.criterion.date1);
        const theNextDay = new Date(searchDate);
        theNextDay.setDate(searchDate.getDate() + 1);
        const qyear = searchDate.getFullYear();
        const qmonth = pad(searchDate.getMonth() + 1, 2);
        const qday = pad(searchDate.getDate(), 2);

        const qyear2 = theNextDay.getFullYear();
        const qmonth2 = pad(theNextDay.getMonth() + 1, 2);
        const qday2 = pad(theNextDay.getDate(), 2);

        let queryLastDate;
        if (filter.criterion.date2) {
            lastDate = new Date(filter.criterion.filterText2);
            const qlyear = lastDate.getFullYear();
            const qlmonth = pad(lastDate.getMonth() + 1, 2);
            const qlday = pad(lastDate.getDate(), 2);
            queryLastDate = qlyear + '/' + qlmonth + '/' + qlday;
        }

        const querySearchDate = qyear + '/' + qmonth + '/' + qday;

        const querySearchDate2 = qyear2 + '/' + qmonth2 + '/' + qday2;

        switch (filter.filterType) {
        case 'equal':
            return '(' + filterElementName + " >= '" + querySearchDate + "' AND " + filterElementName + " < '" + querySearchDate2 + "')";

        case 'diferentThan':
            return '(' + filterElementName + " < '" + querySearchDate + "' OR " + filterElementName + " >= '" + querySearchDate2 + "')";

        case 'biggerThan':
            return filterElementName + " > '" + querySearchDate + "'";

        case 'notGreaterThan':
            return filterElementName + " <= '" + querySearchDate + "'";

        case 'biggerOrEqualThan':
            return filterElementName + " >= '" + querySearchDate + "'";

        case 'lessThan':
            return filterElementName + " < '" + querySearchDate + "'";

        case 'lessOrEqualThan':
            return filterElementName + " <= '" + querySearchDate + "'";

        case 'between':
            return filterElementName + " > '" + querySearchDate + "' AND " + filterElementName + " <= '" + queryLastDate + "'";

        case 'notBetween':
            return filterElementName + " < '" + querySearchDate + "' OR " + filterElementName + " > '" + queryLastDate + "'";

        case 'in':
        case 'notIn':
            var theFilter = filterElementName;
            if (filter.filterType === 'in') { theFilter = theFilter + ' IN ('; }
            if (filter.filterType === 'notIn') { theFilter = theFilter + ' NOT IN ('; }

            var dates = filter.criterion.dateList;
            for (var d in dates) {
                var theDate = new Date(dates[d]);
                var Inyear = theDate.getFullYear();
                var Inmonth = pad(theDate.getMonth() + 1, 2);
                var Inday = pad(theDate.getDate(), 2);
                var InquerySearchDate = Inyear + '/' + Inmonth + '/' + Inday;

                theFilter = theFilter + "'" + InquerySearchDate + "'";
                if (d < dates.length - 1) { theFilter = theFilter + ', '; }
            }
        }

        return theFilter + ')';
    }
}
