var DataSources = connection.model('DataSources');

var db = function () {
    /*this.host = data.host;
     this.user = data.userName;
     this.password = data.password;
     this.database = data.database;*/
    this.connection = null;
};

exports.db = db;

db.prototype.connect = function(data, done) {
    var DB = this;


    var JDBC = require('jdbc');
    var jinst = require('jdbc/lib/jinst');


    if (!jinst.isJvmCreated()) {
        jinst.addOption("-Xrs");
        jinst.setupClasspath(['./server/jdbc/oracle/ojdbc7.jar','./server/jdbc/oracle/orai18n.jar','./server/jdbc/oracle/xdb6.jar']);
    }

    var config = {
        // SparkSQL configuration to your server
        url: 'jdbc:oracle:thin:'+data.userName+'/'+data.password+'@'+data.host+':'+data.port+'/'+data.database,
        drivername: 'oracle.jdbc.OracleDriver',
        minpoolsize: 1,
        maxpoolsize: 100,
        properties: {}
      };

      DB.datasourceID = data._id;

      DB.connection = new JDBC(config);

      DB.connection.initialize(function(err) {
        if (err) {
            done(err);
            return console.error('Connection Error: '+err);
            saveToLog(req,'Error on connection: '+err, 300,'JO-002','',data.datasourceID);
        } else {
            done(false, DB.connection);
        }
      });
};

db.prototype.end = function() {
  /*  this.connection.release(function(err) {
        if (err) { console.error(err.message); }
    });*/
    //This is released in the query itself...
};


/*
db.prototype.query = function(connection, query, done) {
var asyncjs = require('async');
    connection.reserve(function(err, connObj) {
    if (connObj) {
      var conn = connObj.conn;

      // Query the database.
      asyncjs.series([
        function(callback) {
          // Select statement example.
          conn.createStatement(function(err, statement) {
            if (err) {
              done(err);
            } else {
              statement.setFetchSize(100, function(err) {
                if (err) {
                  done(err);
                } else {
                    //Execute a query
                    statement.executeQuery(query,
                      function(err, resultset) {
                        if (err) {
                          done(err);
                        } else {
                          resultset.toObjArray(function(err, results) {
                            done(false, {rows: columnNamesToLowerCase(results)});
                          });
                        }
                      });
                }
              });
            }
          });
        },
      ], function(err, results) {
        // Results can also be processed here.
        // Release the connection back to the pool.
        connection.release(connObj, function(err) {
          if (err) {
            done(err);
          }
        });
      });
    }
  });

};
*/

db.prototype.query = function(theQuery, done) {
        query(this.connection, theQuery, function(error, results){
            done(false,{rows: results.rows});
        });
}


/*
db.prototype.executeQuery = function(theConnection, theQuery, done) {
    console.log('executing THE query',theQuery);
    //db.prototype.connect(data, function(error, connection){
        query(theConnection, theQuery, function(error, results){
            setresult({result: 1, items: results.rows});
        });

    //});
}*/

function query(connection, query, done) {
  if (connection)
      {
        var asyncjs = require('async');
            connection.reserve(function(err, connObj) {
            if (connObj) {
              var conn = connObj.conn;

              // Query the database.
              asyncjs.series([
                function(callback) {
                  // Select statement example.
                  conn.createStatement(function(err, statement) {
                    if (err) {
                      done(err);
                    } else {
                      statement.setFetchSize(100, function(err) {
                        if (err) {
                          done(err);
                        } else {
                            //Execute a query
                            statement.executeQuery(query,
                              function(err, resultset) {
                                if (err) {
                                  done(err);
                                } else {
                                  resultset.toObjArray(function(err, results) {
                                    done(false, {rows: columnNamesToLowerCase(results)});
                                  });
                                }
                              });
                        }
                      });
                    }
                  });
                },
              ], function(err, results) {
                // Results can also be processed here.
                // Release the connection back to the pool.
                connection.release(connObj, function(err) {
                  if (err) {
                    done(err);
                  }
                });
              });
            }
          });
      } else {
          //There is no connection
          done("The connection is not active, can't connect to this datasource");
      }
}

db.prototype.getSchemaQuery = function(newSchemas, newTables) {
    return "SELECT t.tablespace_name as table_schema, c.table_name, c.column_name, LOWER(c.data_type) as data_type"+
    " FROM user_tab_columns c, user_tables t WHERE t.tablespace_name in ("+newSchemas+") AND c.table_name IN ("+newTables+")"+
    " AND t.table_name = c.table_name";
};

db.prototype.getLimitString = function(limit, offset) {
    return 'LIMIT '+limit+' OFFSET '+offset;
};

db.prototype.setLimitToSQL = function(sql,limit,offset)
{
   if (limit == -1)
        return sql
       else
        return ' SELECT * FROM (SELECT rownum wst_rnum, a.* FROM('+sql+') a WHERE rownum <='+offset+'+'+limit+') WHERE wst_rnum >='+offset

}


exports.testConnection = function(req,data, setresult) {
    var DB = this;
    var theQuery = 'SELECT tablespace_name as table_schema, table_name as name FROM user_tables';
    db.prototype.connect(data, function(error, connection){
        query(connection, theQuery, function(err, results){
            if (err)
                {
                    setresult({result: 0, msg: 'Error testing connection: '+ err,code:'JO-001',actionCode:'INVALIDATEDTS'});
                    saveToLog(req,'Error testing connection: '+err, 200,'JO-001','',data.datasourceID);
                    DataSources.invalidateDatasource(req,data.datasourceID,'JO-001','INVALIDATEDTS','Error testing connection: '+ err,function(result){
                        //console.log('change status',result);
                    });
                } else {
                    setresult({result: 1, items: results.rows});
                }

        });

    });

   /*
    oracledb.getConnection({
        user          : data.userName,
        password      : data.password,
        connectString : data.host+":"+data.port+"/"+data.database
    },
    function(err, connection) {
        if(err) {
            console.log('Oracle default connection error: '+data.database+err);
            setresult({result: 0, msg: 'Connection Error: '+ err});
            return console.error('Connection Error: ', err);
        }

        console.log('Connected to '+data.database+' getting table names');

        connection.execute("SELECT tablespace_name as table_schema, table_name as name FROM user_tables", [], {outFormat: oracledb.OBJECT}, function(err, result) {
            result.rows = columnNamesToLowerCase(result.rows);


            setresult({result: 1, items: result.rows});

            connection.release(function(err) {
                if (err) { console.error(err.message); }
            });

        });
    });
    */
};

function columnToLowerCase(rows,column) {
    for (var i in rows) {
        for (var key in rows[i]) {
            rows[i][column] = rows[i][column].toLowerCase();
            delete(rows[i][key]);
        }
    }

    return rows;
}

function columnNamesToLowerCase(rows) {
    for (var i in rows) {
        for (var key in rows[i]) {
            rows[i][String(key).toLowerCase()] = rows[i][key];
            delete(rows[i][key]);
        }
    }

    return rows;
}


/*

exports.testConnection = function(data, setresult) {
var JDBC = require('jdbc');
var jinst = require('jdbc/lib/jinst');
var asyncjs = require('async');
if (!jinst.isJvmCreated()) {
    jinst.addOption("-Xrs");

    jinst.setupClasspath(['./server/jdbc/ojdbc7.jar','./server/jdbc/orai18n.jar','./server/jdbc/xdb6.jar']);

    //jinst.setupClasspath(['/Users/hermesromero/projects/wst-enterprise/server/jdbc/postgresql-42.0.0.jar']);
    // jinst.setupClasspath(['./server/jdbc/postgresql-42.0.0.jar']);

    console.log('creating the jinst jvm');
  }
  var config = {
    // SparkSQL configuration to your server
    url: 'jdbc:oracle:thin:widestage/widestage?55@widestage-test.crdxd3i1xxr3.eu-west-1.rds.amazonaws.com:1521/ORCL',
    drivername: 'oracle.jdbc.OracleDriver',
    //url: 'jdbc:postgresql://localhost:5432/postgres',
    //drivername: 'org.postgresql.Driver',

    minpoolsize: 1,
    maxpoolsize: 100,
    user: 'data',
    password: 'pgadild0',
    properties: {}
  };
  var sparksqldb = new JDBC(config);
//initialize
  sparksqldb.initialize(function(err) {
    if (err) {
      console.log(err);
    }
  });

  sparksqldb.reserve(function(err, connObj) {
    if (connObj) {
      console.log("Using connection: " + connObj.uuid);
      var conn = connObj.conn;

      // Query the database.
      asyncjs.series([
        function(callback) {
          // Select statement example.
          conn.createStatement(function(err, statement) {
            if (err) {
              callback(err);
            } else {
              statement.setFetchSize(100, function(err) {
                if (err) {
                  callback(err);
                } else {
            //Execute a query
                    console.log('the query'); //SELECT owner, table_name FROM dba_tables
                  statement.executeQuery("SELECT table_name FROM user_tables", //SELECT owner, table_name FROM all_tables
                      function(err, resultset) {
                        if (err) {
                          callback(err);
                            console.log('the error', err);
                        } else {
                            //console.log('the result', resultset);
                          resultset.toObjArray(function(err, results) {
                            //Printing number of records
                            if (results.length > 0) {
                              console.log("Record count: " + JSON.stringify(results));
                            }
                            callback(null, resultset);
                          });
                        }
                      });
                }
              });
            }
          });
        },
      ], function(err, results) {
        // Results can also be processed here.
        // Release the connection back to the pool.
        sparksqldb.release(connObj, function(err) {
          if (err) {
            console.log(err.message);
          }
        });
      });
    }
  });

};

*/
