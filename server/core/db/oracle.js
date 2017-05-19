var oracledb = require('oracledb');

var db = function () {
    /*this.host = data.host;
     this.user = data.userName;
     this.password = data.password;
     this.database = data.database;*/
    this.connection = null;
};

db.prototype.connect = function(data, done) {
    var DB = this;

    oracledb.getConnection({
        user          : data.userName,
        password      : data.password,
        connectString : data.host+":"+data.port+"/"+data.database
    },
    function(err, connection) {
        if (err) {
            done(err);
            return console.error('Connection Error: '+err);
        }

        DB.connection = connection;

        done(false, DB.connection);
    });
};

db.prototype.end = function() {
    this.connection.release(function(err) {
        if (err) { console.error(err.message); }
    });
};

db.prototype.query = function(query, done) {
    this.connection.execute(query, [], {outFormat: oracledb.OBJECT}, function(err, result) {
        if (err) {
            done(err);
            return console.error('Connection Error: '+err);
        }

        //result.rows = columnNamesToLowerCase(result.rows);
        done(false, {rows: result.rows});
    });
};
/*
db.prototype.getSchemaQuery = function(newSchemas, newTables) {
    return "SELECT t.tablespace_name as table_schema, c.table_name, c.column_name, c.data_type"+
    " FROM user_tab_columns c, user_tables t WHERE t.tablespace_name in ("+newSchemas+") AND c.table_name IN ("+newTables+")"+
    " AND t.table_name = c.table_name";
};
*/
db.prototype.getSchemaQuery = function(newSchemas, newTables) {
    return "SELECT t.owner as table_schema, c.table_name, c.column_name, LOWER(c.data_type) as data_type"+
    " FROM user_tab_columns c, all_tables t WHERE t.owner in ("+newSchemas+") AND c.table_name IN ("+newTables+")"+
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

exports.db = db;

exports.testConnection = function(req,data, setresult) {
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

        var theQuery = 'SELECT user as table_schema, table_name as name FROM user_tables';

        connection.execute(theQuery, [], {outFormat: oracledb.OBJECT}, function(err, result) {
            //result.rows = columnNamesToLowerCase(result.rows);


            setresult({result: 1, items: result.rows});

            connection.release(function(err) {
                if (err) { console.error(err.message); }
            });

        });
    });
};

function columnNamesToLowerCase(rows) {
    for (var i in rows) {
        for (var key in rows[i]) {
            rows[i][String(key).toLowerCase()] = rows[i][key];
            delete(rows[i][key]);
        }
    }

    return rows;
}
