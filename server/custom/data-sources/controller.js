var DataSources = connection.model('DataSources');
require('../../core/controller.js');
function DataSourcesController(model) {
    this.model = model;
    this.searchFields = ['actionCategory'];
}
DataSourcesController.inherits(Controller);
var controller = new DataSourcesController(DataSources);



exports.DataSourcesCreate = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;
    req.body.companyID = 'COMPID';

    //console.log(req.body);

    controller.create(req, function(result){
        serverResponse(req, res, 200, result);
    });
};
//Pat - 07770966919

exports.DataSourcesUpdate = function(req,res){
    //req.query.trash = true;
    //req.query.companyid = true;

    controller.update(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.saveS3Configuration = function(req,res)
{

};

exports.getS3Files = function (req,res){
    var data = req.body;


    console.log(req.body.accessKey);
    console.log(req.body.secret);
    console.log('body '+JSON.stringify(req.body));

    var AWS = require('aws-sdk');
   /*
    AWS.config.update({
        accessKeyId: 'AKIAIXJXZPHV6QXO2ESQ',
        secretAccessKey: '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',
        region: 'us-east-1'
    });
     */
    AWS.config.update({
        accessKeyId: req.body.accessKey,
        secretAccessKey: req.body.secret,
        region: req.body.region
    });

    var s3 = new AWS.S3(), bucket = req.body.bucket, folder = req.body.folder;


    /*

     var params = {
     Bucket: 'STRING_VALUE', * required *
    Delimiter: 'STRING_VALUE',
        EncodingType: 'url',
        Marker: 'STRING_VALUE',
        MaxKeys: 0,
        Prefix: 'STRING_VALUE'
};
s3.listObjects(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
});
*/




 var allKeys = [];

 s3.listObjects({Bucket: 'nodeDream',Marker: 'intalligent'}, function(err, data){
   // console.log(data.Contents);

     for (i = 0; i < data.Contents.length; i++) {

         //console.log(data.Contents[i].Key+ ' ::::  '+data.Contents[i].StorageClass);
         var theFile = {};
         theFile.fileName = data.Contents[i].Key;
         theFile.LastModified = data.Contents[i].LastModified;

         allKeys.push(theFile);
     }

    /*
     allKeys.push(data.Contents);

    if(data.IsTruncated)
        listAllKeys(data.Contents.slice(-1)[0].Key, cb);
    else
        cb();

    */

     //console.log(allKeys);
     serverResponse(req, res, 200, allKeys);
 });




    /*

    if (params.companyID) {
        folder += '/'+params.companyID;
    }
    if (params.path) {
        folder += '/'+params.path;
    }

    console.log('Bucket: '+bucket);
    console.log('Folder: '+folder);

    s3.createBucket({Bucket: bucket}, function() {
        var key = folder+'/'+file.name;

        var S3Params = {
            Bucket: bucket,
            Key: key,
            Body: file.data,
            ACL: "public-read",
            ContentType: file.type
        };

        filesURLs.push('https://s3.amazonaws.com/'+bucket+'/'+key);

        s3.putObject(S3Params, function(err) {
            if(err) throw err;

            uploadToS3(files, params, configuration, done, index+1, filesURLs);
        });
    });  */

}

exports.getEntities = function(req,res)
{
    console.log('Entering entities');
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findOne(req, function(result){

        console.log(JSON.stringify(result));
        if (result.result == 1)
        {
            if (result.item.type == 'MONGODB')
            {
                console.log('MONGODB entities');
                var mongodb = require('../../core/db/mongodb.js');
                var data = {};
                data.host = result.item.params[0].connection.host;
                data.port = result.item.params[0].connection.port;
                data.database = result.item.params[0].connection.database;
                console.log(JSON.stringify(data));
                mongodb.testConnection(data, function(result) {
                    serverResponse(req, res, 200, result);
                });
            }
            if (result.item.type == 'MySQL')
            {
                console.log('MySQL entities');
                var mysql = require('../../core/db/mysql.js');
                var data = {};
                data.host = result.item.params[0].connection.host;
                data.port = result.item.params[0].connection.port;
                data.userName = result.item.params[0].connection.userName;
                data.password = result.item.params[0].connection.password;
                data.database = result.item.params[0].connection.database;
                console.log(JSON.stringify(data));
                mysql.testConnection(data, function(result) {
                    serverResponse(req, res, 200, result);
                });
            }
            if (result.item.type == 'POSTGRE')
            {
                console.log('POSTGRE entities');
                var postgre = require('../../core/db/postgresql.js');
                var data = {};
                data.host = result.item.params[0].connection.host;
                data.port = result.item.params[0].connection.port;
                data.userName = result.item.params[0].connection.userName;
                data.password = result.item.params[0].connection.password;
                data.database = result.item.params[0].connection.database;
                console.log(JSON.stringify(data));
                postgre.testConnection(data, function(result) {
                    serverResponse(req, res, 200, result);
                });
            }
        } else {
           serverResponse(req, res, 200, result);
        }



    });


}

exports.testConnection = function(req,res) {
    
    console.log('entering test connection',req.body.type);
    if (req.body.type == 'MONGODB')
    {
        var mongodb = require('../../core/db/mongodb.js');
    
        mongodb.testConnection(req.body, function(result) {
            serverResponse(req, res, 200, result);
        });
    }
    if (req.body.type == 'MySQL')
    {
        console.log('mysql test connection');
        var mysql = require('../../core/db/mysql.js');
    
        mysql.testConnection(req.body, function(result) {
            serverResponse(req, res, 200, result);
        });
    }
    if (req.body.type == 'POSTGRE')
    {
        console.log('POSTGRE test connection');
        var postgre = require('../../core/db/postgresql.js');

        postgre.testConnection(req.body, function(result) {
        console.log('devloviendo datos...');
            serverResponse(req, res, 200, result);
        });
    }
};


exports.getEntitySchema = function(req,res) {


    console.log('Entering entities schema for connection: ',req.query.datasourceID);
    var theDatasourceID = req.query.datasourceID;
    var theEntities = req.query.entities;
    req.query = {};
    req.query.companyid = true;
    req.query.id = theDatasourceID;

    req.user = {};
    req.user.companyID = 'COMPID';




    controller.findOne(req, function(result){

        console.log(JSON.stringify(result));
        if (result.result == 1)
        {
            if (result.item.type == 'MONGODB')
            {
                console.log('MONGODB entities schema');
                var mongodb = require('../../core/db/mongodb.js');
                var data = {};
                data.host = result.item.params[0].connection.host;
                data.port = result.item.params[0].connection.port;
                data.database = result.item.params[0].connection.database;
                data.entities = theEntities;
                console.log(JSON.stringify(data));
                mongodb.getSchemas(data, function(result) {
                    serverResponse(req, res, 200, result);
                });
            }
            if (result.item.type == 'MySQL')
            {
                console.log(result.item.type+' entities schema');
                var sql = require('../../core/db/sql.js');
                var data = {
                    type: result.item.type,
                    db: 'mysql',
                    host: result.item.params[0].connection.host,
                    port: result.item.params[0].connection.port,
                    userName: result.item.params[0].connection.userName,
                    password: result.item.params[0].connection.password,
                    database: result.item.params[0].connection.database,
                    entities: theEntities
                };
                console.log(JSON.stringify(data));
                sql.getSchemas(data, function(result) {
                    serverResponse(req, res, 200, result);
                });
            }
            if (result.item.type == 'POSTGRE')
            {
                console.log('POSTGRE entities schema');
                var postgre = require('../../core/db/postgresql.js');
                var data = {};
                data.host = result.item.params[0].connection.host;
                data.port = result.item.params[0].connection.port;
                data.userName = result.item.params[0].connection.userName;
                data.password = result.item.params[0].connection.password;
                data.database = result.item.params[0].connection.database;
                data.entities = theEntities;
                console.log(JSON.stringify(data));
                postgre.getSchemas(data, function(result) {
                    serverResponse(req, res, 200, result);
                });
            }
        } else {
            serverResponse(req, res, 200, result);
        }



    });
};

exports.getMongoSchemas = function(req,res) {
    var mongodb = require('../../core/db/mongodb.js');

    mongodb.getSchemas(req.body, function(result) {
        serverResponse(req, res, 200, result);
    });
};

exports.getElementDistinctValues = function(req, res) {
    var data = req.query;

    data.group = {};
    data.sort = {};

    data.fields = [data.elementName];

    data.group[data.elementName] = '$'+data.elementName;
    data.sort[data.elementName] = 1;

    var mongodb = require('../../core/db/mongodb.js');

    mongodb.execOperation('aggregate', data, function(result) {
        serverResponse(req, res, 200, result);
    });
};

exports.DataSourcesFindAll = function(req,res)
{
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

            controller.findAll(req, function(result){
                serverResponse(req, res, 200, result);
                console.log('getting all datasources');
            });
}

exports.DataSourcesFindOne = function(req,res){

    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
};


function getKP (target,dbstruc) {
    for (var k in target) {
        if(typeof target[k] !== "object"){
            if (target.hasOwnProperty(k) && !dbstruc.hasOwnProperty(k)) {
                dbstruc[k] = typeof target[k];
            }
        }else{
            dbstruc[k] = {};
            getKP(target[k],dbstruc[k]);
        }
    }
}

function getElementList (target,elements,parent) {
    for (var k in target)
    {
        if(typeof target[k] !== "object")
        {
            if (target.hasOwnProperty(k) )
            {

                if (k >= 0)
                {
                    /*
                    if (parent != '')
                    {
                        //console.log(parent+'.'+k+':'+typeof target[k]);
                        var node = parent+'.'+k+':array';
                    } else {
                        //console.log(k+':'+typeof target[k]);
                        var node = k+':array';
                    }
                    */
                } else {
                    if (parent != '')
                    {
                        //console.log(parent+'.'+k+':'+typeof target[k]);
                        var node = parent+'.'+k+':'+typeof target[k];
                    } else {
                        //console.log(k+':'+typeof target[k]);
                        var node = k+':'+typeof target[k];
                    }

                    if (elements.indexOf(node) == -1)
                        elements.push(node);

                }



                //console.log(typeof target[k]);
                //elements.push(target[k]);
            }

        } else {
            //console.log(target[k].name);
            if (target[k])
                if (target[k][0] == 0)
                {
                    //es un array
                    console.log('SOY UN ARRAY');
                }
            /*
            if (k != 0)
            {
                if (parent != '')
                {
                    var nodeDesc = parent+'.'+k+':object';
                    var node = parent+'.'+k;
                } else {
                    var nodeDesc = k+':object';
                    var node = k;
                }
            } else {
                var node = parent;
            }

            */

            if (parseInt(k) != k)
            {
                if (parent != '')
                {
                    var nodeDesc = parent+'.'+k+':'+typeof target[k];
                    var node = parent+'.'+k;
                } else {
                    var nodeDesc = k+':'+typeof target[k];
                    var node = k;
                }
            } else {
                var node = parent;
            }



            if (elements.indexOf(nodeDesc) == -1)
            {
                elements.push(nodeDesc);
                console.log(nodeDesc);
            }
                getElementList(target[k],elements,node);
        }
    }
}


