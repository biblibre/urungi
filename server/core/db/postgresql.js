var pg = require('pg');

var db = function () {
    /*this.host = data.host;
     this.user = data.userName;
     this.password = data.password;
     this.database = data.database;*/
    this.connection = null;
};

db.prototype.connect = function(data, done) {
    var DB = this;

    var conString = 'postgres://'+data.userName+':'+data.password+'@'+data.host+':'+data.port+'/'+data.database;

    var client = new pg.Client(conString);

    client.connect(function(err) {
        if (err) {
            done(err);
            return console.error('Connection Error: '+err);
        }

        DB.connection = client;

        done(false, DB.client);
    });
};

db.prototype.end = function() {
    this.connection.end();
};

db.prototype.query = function(query, done) {
    this.connection.query(query, function(err, result) {
        if (err) {
            done('Query Error: '+err);
            return console.error('Query Error: '+err);
        }

        done(false, {rows: result.rows});
    });
};

db.prototype.getSchemaQuery = function(newSchemas, newTables) {
    return "SELECT table_schema, table_name, column_name, data_type FROM information_schema.columns WHERE table_schema in ("+newSchemas+") AND table_name in ("+newTables+")";
};

db.prototype.getTables = function() {
    return "SELECT table_name, table_schema FROM information_schema.tables where table_schema not in ('pg_catalog','information_schema') and table_type='BASE TABLE'";
}

db.prototype.getColumns = function ()
{
    return "SELECT table_schema, table_name, column_name, data_type,is_nullable, cols.character_maximum_length as length, cols.numeric_precision as precission, cols.numeric_scale as scale FROM information_schema.columns cols where table_schema not in ('pg_catalog','information_schema') order by table_name, ordinal_position";
}

db.prototype.getTableJoins = function()
{
    return "SELECT tc.constraint_name, tc.table_schema, tc.table_name, kcu.column_name, ccu.table_schema as foreign_table_schema, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM  information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE constraint_type = 'FOREIGN KEY'";
}

db.prototype.getPKs = function()
{
    return "select tc.table_schema, tc.table_name, kc.column_name, kc.position_in_unique_constraint from   information_schema.table_constraints tc,  information_schema.key_column_usage kc  where  tc.constraint_type = 'PRIMARY KEY'  and kc.table_name = tc.table_name and kc.table_schema = tc.table_schema and kc.constraint_name = tc.constraint_name order by 1, 2";
}



db.prototype.getLimitString = function(limit, offset) {
    return ' LIMIT '+limit+' OFFSET '+offset;
};

db.prototype.setLimitToSQL = function(sql,limit,offset)
{
   if (limit == -1)
        return sql
       else
    return sql + ' LIMIT '+limit+' OFFSET '+offset;

}

exports.db = db;

exports.testConnection = function(req,data, setresult) {

    var conString = 'postgres://'+data.userName+':'+data.password+'@'+data.host+':'+data.port+'/'+data.database;

    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.log('Postgresql default connection error: ',conString, err);
            setresult({result: 0, msg: 'Connection Error: '+ err});
            return console.error('Connection Error: ', err);
        }


        client.query("SELECT table_schema || '.' || table_name as name  from information_schema.tables where table_schema not in ('pg_catalog','information_schema')", function(err, result) {
            done();

            setresult({result: 1, items: result.rows});
            client.end();
        });
    });
};
