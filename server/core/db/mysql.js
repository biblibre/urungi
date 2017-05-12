var mysql = require('mysql');
var DataSources = connection.model('DataSources');

var db = function () {
    /*this.host = data.host;
    this.user = data.userName;
    this.password = data.password;
    this.database = data.database;*/
    this.connection = null;
};

db.prototype.connect = function(data, done) {
    var DB = this;

    var connection = mysql.createConnection({
        host     : data.host,
        port     : data.port,
        user     : data.userName,
        password : data.password,
        database : data.database
    });

    connection.connect(function(err) {
        if (err) {
            done(err.stack);
            return console.error('Connection Error: '+err.stack);
        }

        DB.connection = connection;

        done(false, DB.connection);
    });
};

db.prototype.end = function() {
    this.connection.end();
};

db.prototype.query = function(query, done) {
    this.connection.query(query, function(err, rows, fields) {
        if (err) {
            done(err.stack);
            return console.error('Connection Error: '+err.stack);
        }

        done(false, {rows: rows});
    });
};

db.prototype.getSchemaQuery = function(newSchemas, newTables) {
    return "SELECT table_schema, table_name, column_name, data_type FROM information_schema.columns WHERE table_schema in ("+newSchemas+") AND table_name in ("+newTables+")";
};

db.prototype.getLimitString = function(limit, offset) {
    return ' LIMIT '+offset+', '+limit;
};

db.prototype.setLimitToSQL = function(sql,limit,offset)
{
   if (limit == -1)
        return sql
       else
    return sql + ' LIMIT '+offset+', '+limit;

}

exports.db = db;

exports.testConnection = function(req,data, setresult) {
    var connection = mysql.createConnection({
        host     : data.host,
        port     : data.port,
        user     : data.userName,
        password : data.password,
        database : data.database
    });

        connection.connect(function(err) {
            if (err) {
                        setresult({result: 0, msg: 'Error testing connection: '+ err,code:'MY-001',actionCode:'INVALIDATEDTS'});
                        saveToLog(req,'Error testing connection: '+err, 200,'MY-001','',data.datasourceID);
                        DataSources.invalidateDatasource(req,data.datasourceID,'MY-001','INVALIDATEDTS','Error testing connection: '+ err,function(result){

                        });
            } else {

                if (data.database)
                    var tablesSQL = "select table_schema, table_name as name from information_schema.tables where table_schema = '"+data.database+"'";
                else
                    var tablesSQL = "select table_schema, table_name as name from information_schema.tables where table_schema not in ('information_schema','mysql','performance_schema')"

                connection.query(tablesSQL, function(err, rows, fields) {
                    if (err) {
                            setresult({result: 0, msg: 'Error executing test connection SQL : '+ err,code:'MY-002',actionCode:'MESSAGEWST'});
                            saveToLog(req,'Error executing test connection SQL : '+err, 400,'MY-002','',data.datasourceID);
                        } else {
                            setresult({result: 1, items: rows});
                            connection.end();
                        }
                });
            }
    });






};
