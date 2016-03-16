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


    controller.create(req, function(result){
        serverResponse(req, res, 200, result);
    });
};


exports.DataSourcesUpdate = function(req,res){

    controller.update(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.saveS3Configuration = function(req,res)
{

};

exports.getS3Files = function (req,res){
    var data = req.body;


    var AWS = require('aws-sdk');

    AWS.config.update({
        accessKeyId: req.body.accessKey,
        secretAccessKey: req.body.secret,
        region: req.body.region
    });

    var s3 = new AWS.S3(), bucket = req.body.bucket, folder = req.body.folder;





 var allKeys = [];

     s3.listObjects({Bucket: req.body.bucket,Marker: req.body.marker}, function(err, data){


     for (i = 0; i < data.Contents.length; i++) {

         var theFile = {};
         theFile.fileName = data.Contents[i].Key;
         theFile.LastModified = data.Contents[i].LastModified;

         allKeys.push(theFile);
     }

     serverResponse(req, res, 200, allKeys);
 });


}

exports.getEntities = function(req,res)
{
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findOne(req, function(result){

        if (result.result == 1)
        {
            if (result.item.type == 'MONGODB')
            {
                var mongodb = require('../../core/db/mongodb.js');
                var data = {};
                data.host = result.item.params[0].connection.host;
                data.port = result.item.params[0].connection.port;
                data.database = result.item.params[0].connection.database;
                mongodb.testConnection(data, function(result) {
                    serverResponse(req, res, 200, result);
                });
            }
            if (result.item.type == 'POSTGRE')
            {
                var postgre = require('../../core/db/postgresql.js');
                var data = {};
                data.host = result.item.params[0].connection.host;
                data.port = result.item.params[0].connection.port;
                data.userName = result.item.params[0].connection.userName;
                data.password = result.item.params[0].connection.password;
                data.database = result.item.params[0].connection.database;
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

    if (req.body.type == 'MONGODB')
    {
        var mongodb = require('../../core/db/mongodb.js');
    
        mongodb.testConnection(req.body, function(result) {
            serverResponse(req, res, 200, result);
        });
    }
    if (req.body.type == 'MySQL')
    {
        var mysql = require('../../core/db/mysql.js');
    
        mysql.testConnection(req.body, function(result) {
            serverResponse(req, res, 200, result);
        });
    }
    if (req.body.type == 'POSTGRE')
    {
        var postgre = require('../../core/db/postgresql.js');

        postgre.testConnection(req.body, function(result) {
            serverResponse(req, res, 200, result);
        });
    }
};


exports.getEntitySchema = function(req,res) {

    var theDatasourceID = req.query.datasourceID;
    var theEntities = req.query.entities;
    req.query = {};
    req.query.companyid = true;
    req.query.id = theDatasourceID;

    req.user = {};
    req.user.companyID = 'COMPID';




    controller.findOne(req, function(result){

        if (result.result == 1)
        {
            if (result.item.type == 'MONGODB')
            {
                var mongodb = require('../../core/db/mongodb.js');
                var data = {};
                data.host = result.item.params[0].connection.host;
                data.port = result.item.params[0].connection.port;
                data.database = result.item.params[0].connection.database;
                data.entities = theEntities;
                mongodb.getSchemas(data, function(result) {
                    serverResponse(req, res, 200, result);
                });
            }
            if (result.item.type == 'POSTGRE')
            {
                var postgre = require('../../core/db/postgresql.js');
                var data = {};
                data.host = result.item.params[0].connection.host;
                data.port = result.item.params[0].connection.port;
                data.userName = result.item.params[0].connection.userName;
                data.password = result.item.params[0].connection.password;
                data.database = result.item.params[0].connection.database;
                data.entities = theEntities;
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

                } else {
                    if (parent != '')
                    {
                        var node = parent+'.'+k+':'+typeof target[k];
                    } else {
                        var node = k+':'+typeof target[k];
                    }
                    if (elements.indexOf(node) == -1)
                        elements.push(node);
                }

            }

        } else {

            if (target[k])
                if (target[k][0] == 0)
                {

                }


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
            }
                getElementList(target[k],elements,node);
        }
    }
}


