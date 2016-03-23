var mysql = require('mysql');

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
    return 'LIMIT '+offset+', '+limit;
};

exports.db = db;

exports.testConnection = function(data, setresult) {
    var connection = mysql.createConnection({
        host     : data.host,
        user     : data.userName,
        password : data.password,
        database : data.database
    });

    connection.connect(function(err) {
        if (err) {
            console.log('MySQL connection error: '+ err.stack);
            setresult({result: 0, msg: 'Connection Error: '+err.stack});
            return console.error('Connection Error: '+err.stack);
        }

        console.log('Connected to '+data.host+' as id '+connection.threadId+', getting table names');

        connection.query("select table_schema, table_name as name from information_schema.tables where table_schema not in ('information_schema','mysql','performance_schema')", function(err, rows, fields) {
            if (err) throw err;

            console.log(rows);
            setresult({result: 1, items: rows});
            connection.end();
        });
    });
};