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
            done(err);
            return console.error('Connection Error: '+err);
        }

        done(false, {rows: result.rows});
    });
};

db.prototype.getSchemaQuery = function(newSchemas, newTables) {
    return "SELECT table_schema, table_name, column_name, data_type FROM information_schema.columns WHERE table_schema in ("+newSchemas+") AND table_name in ("+newTables+")";
};

db.prototype.getLimitString = function(limit, offset) {
    return 'LIMIT '+limit+' OFFSET '+offset;
};

exports.db = db;

exports.testConnection = function(data, setresult) {
    var conString = 'postgres://'+data.userName+':'+data.password+'@'+data.host+'/'+data.database;
    //var conString = 'postgres://'+data.userName+':'+data.password+'@'+data.host;

    //this initializes a connection pool
    //it will keep idle connections open for a (configurable) 30 seconds
    //and set a limit of 20 (also configurable)
    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.log('Postgresql default connection error: ',conString, err);
            setresult({result: 0, msg: 'Connection Error: '+ err});
            return console.error('Connection Error: ', err);
        }

        //console.log('Connected to ',conString, 'getting table names');
        client.query("SELECT table_schema || '.' || table_name as name  from information_schema.tables where table_schema not in ('pg_catalog','information_schema')", function(err, result) {
            done();

            setresult({result: 1, items: result.rows});
            client.end();


            /* if(err) {
             return console.error('error running query', err);
             }
             console.log(result.rows[0].number);
             */
            //output: 1
        });
    });
};
