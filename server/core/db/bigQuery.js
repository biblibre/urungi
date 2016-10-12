/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 11/07/16
 * Time: 11:36
 * To change this template use File | Settings | File Templates.
 */




var bq = require('bigquery');


var db = function () {
    /*this.host = data.host;
     this.user = data.userName;
     this.password = data.password;
     this.database = data.database;*/
    this.connection = null;
};

exports.db = db;

// https://www.npmjs.com/package/bigquery

db.prototype.connect = function(data, done) {
    var DB = this;

    DB.connection = bq;

    var jsonFile = __dirname + '/../../keys/COMPID/bigQuery/Essential_Big_Data-b8c90025164d.json';

    bq.init({
        json_file: jsonFile
    });
};


exports.testConnection = function(data, setresult) {
    console.log('test connection');
    var jsonFile = __dirname + '/../../keys/COMPID/bigQuery/Essential_Big_Data-b8c90025164d.json';

    bq.init({
        json_file: jsonFile
    });

    bq.dataset.list(data.database, function(e,r,d){
        if(e) {
            console.log(e);
            setresult({result: 0, msg: 'Connection Error: '+ e});
        }

        var jsonObj = JSON.parse(d);
        var rows = [];
        if (d)
        {

            getBigqueryDataset(bq,data.database,jsonObj,0,rows,function(){
                setresult({result: 1, items: rows});
            });

            /*
            for (var i in jsonObj.datasets)
            {
                console.log('getting datasetID ',jsonObj.datasets[i].datasetReference.datasetId);

                bq.table.list(data.database, jsonObj.datasets[i].datasetReference.datasetId, function(e,r,d){
                    if(e) console.log(e);
                    var jsonObj2 = JSON.parse(d);

                    console.log('the tables',jsonObj2.tables);
                    for (var z in jsonObj2.tables)
                    {
                        rows.push({name:jsonObj2.tables[z].id});
                    }



                    //if (i == jsonObj.datasets.length -1)
                    //{
                        console.log('the tables',JSON.stringify(rows));
                        setresult({result: 1, items: rows});
                    //}


                });

            }*/
        }

    });

        /*console.log('Connected to ',conString, 'getting table names');
        client.query("SELECT table_schema || '.' || table_name as name  from information_schema.tables where table_schema not in ('pg_catalog','information_schema')", function(err, result) {
            done();

            setresult({result: 1, items: result.rows});
            client.end();


        });
    });*/
};

function getBigqueryDataset(bq,database,jsonObj,index,rows,done)
{
    if (jsonObj.datasets[index] == undefined)
        {
          done();

        } else {


            bq.table.list(database, jsonObj.datasets[index].datasetReference.datasetId, function(e,r,d){
                    if(e) console.log(e);
                    var jsonObj2 = JSON.parse(d);

                    for (var z in jsonObj2.tables)
                    {
                        rows.push({name:jsonObj2.tables[z].id});
                    }


                    getBigqueryDataset(bq,database,jsonObj,index+1,rows,done);

                    //if (i == jsonObj.datasets.length -1)
                    //{
                    //    console.log('the tables',JSON.stringify(rows));
                    //    setresult({result: 1, items: rows});
                    //}


                });

        }

}


exports.getSchemas = function(data, setresult) {


        var collections = data.entities;

        //console.log(JSON.stringify(collections));

        //get schemas
        var projects = [];
        var datasets = [];
        var tables = [];
        var schemasTables = [];


        for (var i in collections) {
            var res0 = String(collections[i].name).split(':');
            var project = res0[0];
            var res1 = String(res0[1]).split('.');
            var dataset = res1[0];
            var table = res1[1];


            if (projects.indexOf(project) == -1)
                projects.push(project);
            if (datasets.indexOf(dataset) == -1)
                datasets.push(dataset);
            if (tables.indexOf(table) == -1)
                tables.push(table);

            if (schemasTables.indexOf({name: collections[i].name,project:project, dataset:dataset, table:table}) == -1)
            {
                var stable = {name: collections[i].name,project:project, dataset:dataset, table:table};
                schemasTables.push(stable);
            }

        }


        //console.log(JSON.stringify(schemasTables));

        getTableFields(schemasTables,0,[],function(fields){
            setresult({result: 1, items: fields});
        });

};

function generateShortUID() {
    return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
}


function getTableFields(tables,index,fields, done)
{
    if (!tables[index])
    {
        done(fields);
        return;

    } else {

        var jsonFile = __dirname + '/../../keys/COMPID/bigQuery/Essential_Big_Data-b8c90025164d.json';
        var collectionID = 'WST'+generateShortUID();
        var collectionName = tables[index].dataset+'.'+tables[index].table;
        var theCollection = {collectionID: collectionID ,collectionName: collectionName,visible:true,collectionLabel:tables[index].table};
        theCollection.elements = [];

        bq.init({
            json_file: jsonFile
        });
        //console.log('before getting fields');

        bq.table.get(tables[index].project, tables[index].dataset, tables[index].table, function(e,r,d){
            if(e) console.log(e);
            var jsonObj = JSON.parse(d);
            //console.log('after getting fields',jsonObj.schema.fields);
            for (var i in jsonObj.schema.fields)
            {
                //fields.push({name:jsonObj.schema.fields[i].name,type:jsonObj.schema.fields[i].type})

                var elementID = generateShortUID();
                var isVisible = true;
                var type = 'string';
                if (jsonObj.schema.fields[i].type == 'INTEGER' || jsonObj.schema.fields[i].type == 'FLOAT')
                    type = 'number';
                if (jsonObj.schema.fields[i].type == 'TIMESTAMP')
                    type = 'date';
                if (jsonObj.schema.fields[i].type == 'BOOLEAN')
                    type = 'boolean';

                theCollection.elements.push({elementID:elementID,elementName:jsonObj.schema.fields[i].name,elementType:type,visible:isVisible,elementLabel:jsonObj.schema.fields[i].name});
                //table_schema, c.table_name, c.column_name, c.data_type
            }

            fields.push(theCollection);

            getTableFields(tables,index+1,fields,done);
        });

    }
}


db.prototype.getLimitString = function(limit, offset) {
    return 'LIMIT '+limit+' OFFSET '+offset;
};

db.prototype.executeSQLQuery = function(connection,sql,done){

    var jsonFile = __dirname + '/../../keys/COMPID/bigQuery/Essential_Big_Data-b8c90025164d.json';
    bq.init({
        json_file: jsonFile
    });

    bq.job.query(connection.database, sql, function(e,r,d){
        if(e) {
                console.log(e);
              }
        //console.log(JSON.stringify(d));
        if (d.jobComplete)
            {
                var jsonObj = JSON.parse(JSON.stringify(d));

                var results = [];

                for (var r in jsonObj.rows)
                {
                        var theRow = {};
                        for (var field in jsonObj.schema.fields)
                        {
                            theRow[jsonObj.schema.fields[field].name] = jsonObj.rows[r].f[field].v;
                        }
                        results.push(theRow);

                }
                done(results);
            } else {
                /*console.log('big query retrieve query results',connection.database,d.jobReference.jobId);
                bq.job.getQueryResults(connection.database, d.jobReference.jobId, function(e,r,d){
                        var jsonObj = JSON.parse(JSON.stringify(d));
                        console.log('The result',JSON.stringify(d));
                        var results = [];

                        for (var r in jsonObj.rows)
                        {
                                var theRow = {};
                                for (var field in jsonObj.schema.fields)
                                {
                                    theRow[jsonObj.schema.fields[field].name] = jsonObj.rows[r].f[field].v;
                                }
                                results.push(theRow);

                        }
                        done(results);
                });*/

                getQueryResults(connection,d.jobReference.jobId,function(){
                    done(results);
                });

            }
    });
}

function getQueryResults(connection,jobId,done){

    var jsonFile = __dirname + '/../../keys/COMPID/bigQuery/Essential_Big_Data-b8c90025164d.json';
    bq.init({
        json_file: jsonFile
    });

    //console.log('big query retrieve query results',connection.database,jobId);
                bq.job.getQueryResults(connection.database,jobId, function(e,r,d){
                        var jsonObj = JSON.parse(JSON.stringify(d));
                        //console.log('The result',JSON.stringify(d));
                        var results = [];

                        for (var r in jsonObj.rows)
                        {
                                var theRow = {};
                                for (var field in jsonObj.schema.fields)
                                {
                                    theRow[jsonObj.schema.fields[field].name] = jsonObj.rows[r].f[field].v;
                                }
                                results.push(theRow);

                        }
                        done(results);
                });
}


/*
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2("622831930014-7c2rkl33r1sbh1p3ltsdl44ivvl8ubok.apps.googleusercontent.com", "HdyOjXCRKwcx-ScpOgnIGU6E", "http://127.0.0.1:8087/api/custom/websites/get-google-analytics");

var scopes = [
    'https://www.googleapis.com/auth/analytics.readonly'
];

var url = oauth2Client.generateAuthUrl({
    access_type: 'online', // 'online' (default) or 'offline' (gets refresh_token)
    scope: scopes // If you only need one scope you can pass it as string
});

console.log(url);

res.redirect(url);


eso es para conectar, tienes que generar la url de autorización (la que aparece de google diciendo que quieren acceder a tu cuenta, si lo permites o no...)
 como ves se genera la url con tres parametros (api key, api secret y url de retorno)
 una vez se tiene la url se redirecciona al usuario (res.redirect(url);)
 luego en la url de retorno recibes un codigo de autorización (como parametro de la url), con este codigo conectas a la api y ya puedes usarla

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2("622831930014-7c2rkl33r1sbh1p3ltsdl44ivvl8ubok.apps.googleusercontent.com", "HdyOjXCRKwcx-ScpOgnIGU6E", "http://127.0.0.1:8087/api/custom/websites/get-google-analytics");

console.log('auth with code '+req.query.code);

oauth2Client.getToken(req.query.code, function(err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if(!err) {
        oauth2Client.setCredentials(tokens);

        var analytics = google.analytics('v3');

        se coge el codigo con req.query.code y se conecta con setCredentials
        a partir de ahi puedes usar la api sobre la que tengas permiso, por ejemplo en este caso analytics
        los permisos que quieres pedir se ponen en:
        var scopes = [
            'https://www.googleapis.com/auth/bigquery'
        ];
        aqui se pide permiso de solo lectura sobre analytics
        la url de retorno no puede ser cualquiera, tienes que especificarla en la consola de google, si no te dará error
        https://console.developers.google.com/apis/credentials
       asi lo tengo yo





        https://cloud.google.com/bigquery/docs/reference/v2/jobs/query


            In the request body, supply data with the following structure:

        {
            "kind": "bigquery#queryRequest",
            "query": string,
            "maxResults": unsigned integer,
            "defaultDataset": {
            "datasetId": string,
                "projectId": string
        },
            "timeoutMs": unsigned integer,
            "dryRun": boolean,
            "preserveNulls": boolean,
            "useQueryCache": boolean,
            "useLegacySql": boolean
        }







        If successful, this method returns a response body with the following structure:

        {
            "kind": "bigquery#queryResponse",
            "schema": {
            "fields": [
                {
                    "name": string,
                    "type": string,
                    "mode": string,
                    "fields": [
                        (TableFieldSchema)
                    ],
                    "description": string
                }
            ]
        },
            "jobReference": {
            "projectId": string,
                "jobId": string
        },
            "totalRows": unsigned long,
            "pageToken": string,
            "rows": [
            {
                "f": [
                    {
                        "v": (value),
                        "v": string,
                        "v": string,
                        "v": string,
                        "v": string,
                        "v": string,
                        "v": string,
                        "v": string,
                        "v": string,
                        "v": [
                            (TableCell)
                        ],
                        "v": (TableRow)
                    }
                ]
            }
        ],
            "totalBytesProcessed": long,
            "jobComplete": boolean,
            "errors": [
            {
                "reason": string,
                "location": string,
                "debugInfo": string,
                "message": string
            }
        ],
            "cacheHit": boolean
        }


  */
