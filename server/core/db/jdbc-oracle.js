var DataSources = connection.model('DataSources');

var db = function () {
    /* this.host = data.host;
     this.user = data.userName;
     this.password = data.password;
     this.database = data.database; */
    this.connection = null;
};

exports.Db = db;

db.prototype.connect = function (data, done) {
    var DB = this;

    var JDBC = require('jdbc');
    var jinst = require('jdbc/lib/jinst');

    if (!jinst.isJvmCreated()) {
        jinst.addOption('-Xrs');
        jinst.setupClasspath(['./server/jdbc/oracle/ojdbc7.jar', './server/jdbc/oracle/orai18n.jar', './server/jdbc/oracle/xdb6.jar']);
    }

    var config = {
        // SparkSQL configuration to your server
        url: 'jdbc:oracle:thin:' + data.userName + '/' + data.password + '@' + data.host + ':' + data.port + '/' + data.database,
        drivername: 'oracle.jdbc.OracleDriver',
        minpoolsize: 1,
        maxpoolsize: 100,
        properties: {}
    };

    DB.datasourceID = data._id;

    DB.connection = new JDBC(config);

    this.connection = DB.connection;

    DB.connection.initialize(function (err) {
        if (err) {
            done(err);
            return console.error('Connection Error: ' + err);
        } else {
            done(false, DB.connection);
        }
    });
};

db.prototype.end = function () {
    /*  this.connection.release(function(err) {
        if (err) { console.error(err.message); }
    }); */
    // This is released in the query itself...
};

db.prototype.query = function (theQuery, done) {
    query(this.connection, theQuery, function (error, results) {
        if (error) {
            done('Query Error: ' + error);
        } else { done(false, {rows: results.rows}); }
    });
};

function query (connection, query, done) {
    if (connection) {
        var asyncjs = require('async');
        connection.reserve(function (err, connObj) {
            if (err) {
                done(err);
            } else if (connObj) {
                var conn = connObj.conn;

                // Query the database.
                asyncjs.series([
                    function (callback) {
                        // Select statement example.
                        conn.createStatement(function (err, statement) {
                            if (err) {
                                done(err);
                            } else {
                                statement.setFetchSize(100, function (err) {
                                    if (err) {
                                        done(err);
                                    } else {
                                        // Execute a query
                                        statement.executeQuery(query,
                                            function (err, resultset) {
                                                if (err) {
                                                    done(err);
                                                } else {
                                                    resultset.toObjArray(function (err, results) {
                                                        if (err) {
                                                            done(err);
                                                        } else {
                                                            if (results.length > 0) {
                                                                console.log('ID: ' + results[0].ID);
                                                            }

                                                            done(false, {rows: results});
                                                        }
                                                    });
                                                }
                                            });
                                    }
                                });
                            }
                        });
                    },
                ], function (err, results) {
                    if (err) {
                        done(err);
                    } else {
                        // Results can also be processed here.
                        // Release the connection back to the pool.
                        connection.release(connObj, function (err) {
                            if (err) {
                                done(err);
                            }
                        });
                    }
                });
            }
        });
    } else {
        // There is no connection
        done("The connection is not active, can't connect to this datasource");
    }
}

db.prototype.getSchemaQuery = function (newSchemas, newTables) {
    return 'SELECT t.owner as table_schema, c.table_name, c.column_name, LOWER(c.data_type) as data_type' +
    ' FROM user_tab_columns c, all_tables t WHERE t.owner in (' + newSchemas + ') AND c.table_name IN (' + newTables + ')' +
    ' AND t.table_name = c.table_name';
};

db.prototype.getLimitString = function (limit, offset) {
    return 'LIMIT ' + limit + ' OFFSET ' + offset;
};

db.prototype.setLimitToSQL = function (sql, limit, offset) {
    if (limit === -1) { return sql; } else { return ' SELECT * FROM (SELECT rownum wst_rnum, a.* FROM(' + sql + ') a WHERE rownum <=' + offset + '+' + limit + ') WHERE wst_rnum >=' + offset; }
};

exports.testConnection = function (req, data, setresult) {
    var theQuery = 'SELECT user as table_schema, table_name as name FROM user_tables';
    db.prototype.connect(data, function (error, connection) {
        if (error) {
            setresult({result: 0, msg: 'Error testing connection: ' + error, code: 'JO-001', actionCode: 'INVALIDATEDTS'});
            saveToLog(req, 'Error testing connection: ' + error, 200, 'JO-001', '', data.datasourceID);
            DataSources.invalidateDatasource(req, data.datasourceID, 'JO-001', 'INVALIDATEDTS', 'Error testing connection: ' + error, function (result) {
                // console.log('change status',result);
            });
        } else {
            query(connection, theQuery, function (err, results) {
                if (err) {
                    setresult({result: 0, msg: 'Error testing connection: ' + err, code: 'JO-001', actionCode: 'INVALIDATEDTS'});
                    saveToLog(req, 'Error testing connection: ' + err, 200, 'JO-001', '', data.datasourceID);
                    DataSources.invalidateDatasource(req, data.datasourceID, 'JO-001', 'INVALIDATEDTS', 'Error testing connection: ' + err, function (result) {
                        // console.log('change status',result);
                    });
                } else {
                    setresult({result: 1, items: results.rows});
                }
            });
        }
    });
};

// TODO : find a better way to escape arguments
exports.escape = function (param) {
    return '\'{' + param.replace(/[{}\\]/g, '') + '}\'';
};
