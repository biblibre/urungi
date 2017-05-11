var mssql = require('mssql');

var db = function () {
    /*this.host = data.host;
    this.user = data.userName;
    this.password = data.password;
    this.database = data.database;*/
    this.connection = null;
};

db.prototype.connect = function(data, done) {
    var DB = this;

    var connection = new mssql.Connection({
        user: data.userName,
        password: data.password,
        server: data.host,
        database: data.database,
        options: {
            encrypt: false //Use true only for Windows Azure
        }
    }, function(err) {
        if (err) {
            done(err.stack);
            return console.error('Connection Error: '+err.stack);
        }

        DB.connection = connection;

        done(false, DB.connection);
    });
};

db.prototype.end = function() {
    this.connection.close();
};

db.prototype.query = function(query, done) {
    var request = new mssql.Request(this.connection);

    request.query(query, function(err, recordset) {
        if (err) {
            done(err);
            return console.error('Connection Error: '+err);
        }

        done(false, {rows: recordset});
    });
};

db.prototype.getSchemaQuery = function(newSchemas, newTables) {
    return "SELECT table_schema, table_name, column_name, data_type FROM information_schema.columns WHERE table_schema in ("+newSchemas+") AND table_name in ("+newTables+")";
};

db.prototype.getLimitString = function(limit, offset) {
    return " OFFSET "+offset+" ROWS FETCH NEXT "+limit+" ROWS ONLY";
};

db.prototype.setLimitToSQL = function(sql,limit,offset)
{

    var order_by_position = sql.indexOf(" ORDER BY ");
    var defaultOrderBy = '';

    if (order_by_position == -1)
        {
            //no order by, include the default order by
            defaultOrderBy = ' ORDER BY 1 ';
        }

    if (limit == -1)
        return sql
       else
    return sql +defaultOrderBy+ " OFFSET "+offset+" ROWS FETCH NEXT "+limit+" ROWS ONLY";

}

exports.db = db;

exports.testConnection = function(req,data, setresult) {
    var connection = new mssql.Connection({
        user: data.userName,
        password: data.password,
        server: data.host,
        database: data.database,
        options: {
            encrypt: false //Use true only for Windows Azure
        }
    }, function(err) {
        if (err) {
            console.log('MSSQL connection error: '+ err);
            setresult({result: 0, msg: 'Connection Error: '+err});
            return console.error('Connection Error: '+err);
        }

        console.log('Connected to '+data.host+', getting table names');

        var request = new mssql.Request(connection);

        request.query("SELECT table_schema, TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'", function(err, recordset) {
            if (err) throw err;

            setresult({result: 1, items: recordset});
            connection.close();
        });
    });
};
