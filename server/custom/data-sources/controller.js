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


exports.testMongoConnection = function(req,res)
{
    var data = req.body;
    var mongoose = require('mongoose');

    var dbURI =  'mongodb://'+data.host+':'+data.port+'/'+data.database;
    conn = mongoose.createConnection(dbURI,{ server: { poolSize: 5 } });

    conn.on('connected', function () {
        console.log('Mongoose connection open to ' + dbURI);
        conn.db.collectionNames(function (err, names) {
            //console.log(names); // [{ name: 'dbname.myCollection' }]
            serverResponse(req, res, 200, {result: 1, items: names});
            conn.close();
        });
    });
    /*
     mongoose.connection.on('open', function (ref) {
     console.log('Connected to mongo server.');
     //trying to get collection names
     mongoose.connection.db.collectionNames(function (err, names) {
     console.log(names); // [{ name: 'dbname.myCollection' }]
     module.exports.Collection = names;
     });
     })
     */
    conn.on('error',function (err) {
        console.log('Mongoose default connection error: ' + err);
        serverResponse(req, res, 200, {result: 0, msg: 'Connection Error'});
    });


}


exports.getMongoSchemas = function(req,res)
{
    //Get the schema for several mongoDB collections... and send back to the client...
    var data = req.body;
    var collections = data.collections;
    var numDocs = data.numDocs; //number of documents scanned for every collection

    //
    var MongoClient = require('mongodb').MongoClient , assert = require('assert');

    var dbURI =  'mongodb://'+data.host+':'+data.port+'/'+data.database;

        MongoClient.connect(dbURI, function(err, db) {
            if(err) { return console.dir(err); }

            /*
            for (i = 0; i < collections.length; i++) {
                var collectionName = collections[i];

                var collection = db.collection(collectionName);

                collection.find().limit(10).toArray(function(err, results) {

                });
            }
            */
            //console.log(collections);

            var schemas = [];

            getCollectionSchema(db,collections,0,schemas, function() {

                 console.log('--------------- está hecho');
                 //console.log(schemas);
                 serverResponse(req, res, 200, {result: 1, items: schemas});

            });

            //en la última iteración db.close();
    });


}

exports.DataSourcesFindAll = function(req,res)
{
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.company_id = 'COMPID';

            controller.findAll(req, function(result){
                serverResponse(req, res, 200, result);
                console.log('getting all datasources');
            });
}

exports.DataSourcesFindOne = function(req,res){

    req.query.companyid = true;
    req.user = {};
    req.user.company_id = 'COMPID';

    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
};


function getCollectionSchema(db,collections,index,schemas, done)
{
    if (collections[index] == undefined)
    {
        done();
        return;
    }

    var uuid = require('node-uuid');
    var collectionName = collections[index];
    var collectionID = uuid.v4();
    var theCollection = {collectionID: collectionID ,collectionName: collectionName,visible:true,collectionLabel:collectionName};
    theCollection.elements = [];

    console.log('The collection Name '+collectionName);
    var collection = db.collection(collectionName);
    collection.find().limit(100).toArray(function(err, results) {
        //console.log(results);



        var dbstruc = {};
        var elements = [];
        /*
        for (var key in results[0]) {
            console.log ('element found ' +key) ;

        }
        */

        for (i = 0; i < results.length; i++) {

            //getKP(results[i],dbstruc);
            getElementList(results[i],elements,'');

        }

        //getElementList(results[0],elements,'');

        var names = [];


        for (i = 0; i < elements.length; i++) {
               //console.log(elements[i]);
               var str = elements[i];
               if (str)
               {
                   if (str != 'undefined')
                   {
                       var pos = str.indexOf(":");
                       var name = str.substring(0,pos);
                       var type = str.substring(pos+1,str.length);

                       var elementID = uuid.v4();

                       if (name != '_id._bsontype' && name != '_id.id' && name != '__v' )  {

                               if (names.indexOf(name) == -1)
                               {
                                   names.push(name);
                                   var isVisible = true;
                                   if (type == 'object')
                                       isVisible = false;
                                   theCollection.elements.push({elementID:elementID,elementName:name,elementType:type,visible:isVisible,elementLabel:name})
                                   //var element = {colectionName: collectionName,elementName:name,elementType:type}
                               } else {
                                   //el tipo puede cambiar por lo que hay que hacer una comprobación de tipo
                                   for (n = 0; n < theCollection.elements.length; n++) {
                                        if (theCollection.elements[n].elementName == name)
                                        {
                                          if (theCollection.elements[n].elementType == 'object' && type != 'object')
                                          {
                                              theCollection.elements[n].elementType = type;
                                              theCollection.elements[n].visible = true;
                                          }
                                        }
                                   }

                               }

                        }


                    }
               }
        }


        //{"_id":{"_bsontype":"string","id":"string"},"__v":"number","areas":{},"assessmentScope":{},"assessmentScopeEverybody":"boolean","assessmentTo":{},"assessmentToEverybody":"boolean","autoAssessment":"boolean","canView":{},"canViewEverybody":"boolean","canViewScope":{},"canViewScopeEverybody":"boolean","companyID":"string","draft":"boolean","nd_trash_deleted":"boolean","personalityAssessment":"boolean","positionBrand":{"0":"string"},"positionName":"string","ratingCalculationType":"number","status":"number","nd_trash_deleted_date":{},"positionArea":"string","positionCategory":"string","professionalGroup":"string","topPerformerAlgorithm":"boolean","externalData":{}}


        //console.log('dbstruct '+JSON.stringify(dbstruc));
        schemas.push(theCollection);
        getCollectionSchema(db,collections,index+1,schemas, done);


    });


}

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


