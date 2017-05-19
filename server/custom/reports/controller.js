var Reports = connection.model('Reports');

require('../../core/controller.js');

function ReportsController(model) {
    this.model = model;
    this.searchFields = [];
}

ReportsController.inherits(Controller);

var controller = new ReportsController(Reports);

exports.ReportsFindAll = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';
    controller.findAll(req, function(result){
        serverResponse(req, res, 200, result);
    });

};


exports.GetReport = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;



    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
        if ((req.query.mode == 'execute' || req.query.mode == 'preview')  && result.item)
        {
            //Note the execution in statistics
            var statistics = connection.model('statistics');
            var stat = {};
            stat.type = 'report';
            stat.relationedID = result.item._id;
            stat.relationedName = result.item.reportName;

            if (req.query.linked == true)
                stat.action = 'execute link';
                else
                stat.action = 'execute';
            statistics.save(req, stat, function() {

            });
        }
    });
};

exports.ReportsFindOne = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;

    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.ReportsCreate = function(req,res){

    if (!req.session.reportsCreate && !req.session.isWSTADMIN)
    {
        serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to create reports"});
    } else {

        req.query.trash = true;
        req.query.companyid = true;
        req.query.userid = true;

        req.body.owner = req.user._id;
        req.body.isPublic = false;

        controller.create(req, function(result){
            serverResponse(req, res, 200, result);
        });
    }
};

exports.ReportsUpdate = function(req,res){

    req.query.trash = true;
    req.query.companyid = true;
    var data = req.body;

    if (!req.session.isWSTADMIN)
    {
        var Reports = connection.model('Reports');
        Reports.findOne({_id:data._id,owner:req.user._id,companyID:req.user.companyID}, {_id:1}, {}, function(err, item){
            if(err) throw err;
            if (item) {
                controller.update(req, function(result){
                    serverResponse(req, res, 200, result);
                })
            } else {
                serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to update this report, or this report do not exists"});
            }
        });
    } else {
        controller.update(req, function(result){
            serverResponse(req, res, 200, result);
        })
    }

};

exports.PublishReport = function(req,res)
{
    var data = req.body;
    var parentFolder = data.parentFolder;

    //have the connected user permissions to publish?
    var Reports = connection.model('Reports');
    var find = {_id:data._id,owner:req.user._id,companyID:req.user.companyID};

    if (req.session.isWSTADMIN)
        find = {_id:data._id,companyID:req.user.companyID};



    Reports.findOne(find, {}, {}, function(err, report){
        if(err) throw err;
        if (report) {
            report.parentFolder = parentFolder;
            report.isPublic = true;


            req.body = report;

            controller.update(req, function(result){
                    serverResponse(req, res, 200, result);
                });
        } else {

            serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to publish this report, or this report do not exists"});
        }

    });

}


exports.UnpublishReport = function(req,res)
{
    var data = req.body;

    //TODO:tiene el usuario conectado permisos para publicar?
    var Reports = connection.model('Reports');
    var find = {_id:data._id,owner:req.user._id,companyID:req.user.companyID};

    if (req.session.isWSTADMIN)
        find = {_id:data._id,companyID:req.user.companyID};

    Reports.findOne(find, {}, {}, function(err, report){
        if(err) throw err;
        if (report) {
            report.isPublic = false;

            req.body = report;

            controller.update(req, function(result){
                    serverResponse(req, res, 200, result);
                });
        } else {
            serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to unpublish this report, or this report do not exists"});
        }

    });

}

exports.ReportsDelete = function(req,res){
    var data = req.body;

    req.query.trash = true;
    req.query.companyid = true;

    data._id = data.id;
    data.nd_trash_deleted = true;
    data.nd_trash_deleted_date = new Date();

    req.body = data;

    if (!req.session.isWSTADMIN)
    {
        var Reports = connection.model('Reports');
        Reports.findOne({_id:data._id,owner:req.user._id}, {_id:1}, {}, function(err, item){
            if(err) throw err;
            if (item) {
                controller.remove(req, function(result){
                    serverResponse(req, res, 200, result);
                });
            } else {
                serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to delete this report"});
            }
        });

    } else {
        controller.remove(req, function(result){
            serverResponse(req, res, 200, result);
        });
    }
};

exports.PreviewQuery = function(req,res)
{
    var data = req.query;
    var query = data.query;


    debug(query);

    processDataSources(query.datasources,query.layers, {},query, function(result) {
        //debug(result);
        serverResponse(req, res, 200, result);
    });

    /*processQuery(query, function(result){
        debug(result);
        serverResponse(req, res, 200, result);
    });*/
};

exports.ReportsGetData = function(req, res) {
    var data = req.query;
    var query = data.query;
    processDataSources(req,query.datasources,query.layers, {page: (data.page) ? data.page : 1},query, function(result) {
        //debug(result);
        serverResponse(req, res, 200, result);
    });
};

function processQuery(query, done)
{
    for (var i in query.datasources) {
        processDataSource(query.datasources[i], function(result){
            done(result);
        });
    }
}

function processDataSource(datasourceQuery, done)
{
    //buscar los datasources en el repositorio
    var DataSources = connection.model('DataSources');
    var queryDTS = [];
    var notFoundDTS = [];


        DataSources.findOne({ _id: datasourceQuery.datasourceID }, function (err, dts) {
            if (dts) {
                executeDataSourceQuery(datasourceQuery,dts, function(result){
                    done(result);
                });
            } else {
                notFoundDTS.push(datasourcesList[i]);
            }
        });


}

function processDataSources(req,dataSources,layers, params,query, done, result, index) {
    var index = (index) ? index : 0;
    if (dataSources)
        var dataSource = (dataSources[index]) ? dataSources[index] : false;
    var result = (result) ? result : [];
    var thereAreJoins = false;

    if (!dataSource || dataSource.datasourceID == undefined) {
            done(result);
            return;
    }


    var Layers = connection.model('Layers');
    Layers.find({ _id: {$in:layers}},{}, function (err, theLayers) {

        if (theLayers)
        {


        var DataSources = connection.model('DataSources');

            DataSources.findOne({ _id: dataSource.datasourceID}, {}, function (err, dts) {
                if (dts) {
                    for (var l in theLayers)
                    {
                        for (var s in theLayers[l].params.schema)
                        {
                            for (var j in dataSource.collections) {
                                if (theLayers[l].params.schema[s].collectionID == dataSource.collections[j].collectionID) {
                                    dataSource.collections[j]['schema'] = theLayers[l].params.schema[s];
                                }
                            }
                        }

                       // debug(theLayers[l].params.joins);

                        for (var n in theLayers[l].params.joins)
                        {

                            for (var j in dataSource.collections) {
                                if (theLayers[l].params.joins[n].sourceCollectionID == dataSource.collections[j].collectionID || theLayers[l].params.joins[n].targetCollectionID == dataSource.collections[j].collectionID) {
                                //if (theLayers[l].params.joins[n].sourceCollectionID == dataSource.collections[j].collectionID ) {
                                    {

                                        if (theLayers[l].params.joins[n].sourceCollectionID == dataSource.collections[j].collectionID)
                                            var theOther = theLayers[l].params.joins[n].targetCollectionID;
                                        if (theLayers[l].params.joins[n].targetCollectionID == dataSource.collections[j].collectionID)
                                            var theOther = theLayers[l].params.joins[n].sourceCollectionID;

                                        if (isTargetInvolved(dataSource.collections,theOther))
                                        {
                                            if (!dataSource.collections[j]['joins'])
                                               dataSource.collections[j]['joins'] = [];

                                            dataSource.collections[j]['joins'].push(theLayers[l].params.joins[n]);

                                            thereAreJoins = true;
                                        }
                                    }
                                }
                            }
                        }

                    }

                    switch (dts.type) {
                        case 'MONGODB':
                            var mongodb = require('../../core/db/mongodb.js');

                            mongodb.processCollections(req,query,dataSource.collections, dts, params,thereAreJoins, function(data) {


                                if (dataSource.collections.length > 1)
                                {

                                    mergeResults(dataSource.collections,query,function(mergedResults){
                                        var finalResult = {result: 1, data:mergedResults,sql:'No SQL available for MongoDB'};
                                        result = finalResult;
                                    });
                                }  else {

                                    var finalResult = {result: 1, data:dataSource.collections[0].result,sql:'No SQL available for MongoDB'};
                                    result = finalResult;

                                }



                                processDataSources(req,dataSources,layers, params, query, done, result, index+1);
                            });
                        break;
                        case 'MySQL': case 'POSTGRE': case 'ORACLE': case 'MSSQL': case 'BIGQUERY': case 'JDBC-ORACLE':
                            var sql = require('../../core/db/sql.js');

                            sql.processCollections(req,query,dataSource.collections, dts, params,thereAreJoins, function(data) {


                                result = data;

                                processDataSources(req,dataSources,layers, params, query, done, result, index+1);
                            });
                    }
                } else {
                    result = {result: 0, msg: 'This Datasource does not exists anymore! '+dataSource.datasourceID};
                    processDataSources(req,dataSources,layers, params, query, done, result, index+1);
                }
            });
        }
    });
}

function isTargetInvolved(collections,theOtherID)
{
    var found = false;

    for (var collection in collections)
    {
        if (collections[collection].collectionID == theOtherID)
            found = true;
    }

    return found;

}


function mergeResults(collections,query,done){
    var isLastCollection = false;
    var lastResults;
    for (var collection in collections)
    {
        if (collection == collections.length -1)
        {
            isLastCollection = true;
            if (isLastCollection && collections[collection].joins.length == 0)
            {
                sortMergeResults(lastResults,query, function(){
                    done(lastResults);
                    return;
                });
            }
        }
        for (var join in collections[collection].joins)
        {
            var isLast = false;
            if (join == collections[collection].joins.length -1 && isLastCollection)
            {
                isLast = true;

                if (isLast && collections[collection].joins[join].sourceCollectionID != collections[collection].collectionID)
                    {
                        sortMergeResults(lastResults,query, function(){
                            done(lastResults);
                            return;
                        });
                    }
            }


            //sourceCollection
            if (collections[collection].joins[join].sourceCollectionID == collections[collection].collectionID)
            {
            var sourceCollection = collections[collection].joins[join].sourceCollectionID;
            //var sourceElement = collections[collection].joins[join].sourceElementName;
            var sourceElement = ('wst'+collections[collection].joins[join].sourceElementID.toLowerCase()).replace(/[^a-zA-Z ]/g,'');
            var targetCollection = collections[collection].joins[join].targetCollectionID;
            //var targetElement = collections[collection].joins[join].targetElementName;
            var targetElement = ('wst'+collections[collection].joins[join].targetElementID.toLowerCase()).replace(/[^a-zA-Z ]/g,'');

            //console.log('source element',sourceElement);
            //console.log('target element',targetElement);



            mergeTwoCollections(collections,sourceCollection,sourceElement,targetCollection,targetElement,isLast, function(result){

                if (result.result == 1)
                {
                    sortMergeResults(result.results,query, function(){
                        done(result.results);
                    });
                } else {
                    if (result.results)
                        lastResults = result.results;
                }

            });
            }
        }
    }
}


function sortMergeResults(tempResults,query,done)
{
    //Orderbys

    var firstBy = require('thenBy');


    if (query.order.length == 1)
    {

        if (query.order[0].aggregation) {
            var fieldName0 = query.order[0].collectionID+'_'+ query.order[0].elementName+query.order[0].aggregation;
        } else {
            var fieldName0 = query.order[0].collectionID+'_'+ query.order[0].elementName;
        }

        var sortType = -1;
        if (query.order[0].sortType == 1)  sortType = 1;

        tempResults.sort(
                firstBy(fieldName0,query.order[0].sortType*-1));
    }

    if (query.order.length == 2)
    {
        if (query.order[0].aggregation) {
            var fieldName0 = query.order[0].collectionID+'_'+ query.order[0].elementName+query.order[0].aggregation;
        } else {
            var fieldName0 = query.order[0].collectionID+'_'+ query.order[0].elementName;
        }

        if (query.order[1].aggregation) {
            var fieldName1 = query.order[1].collectionID+'_'+ query.order[1].elementName+query.order[1].aggregation;
        } else {
            var fieldName1 = query.order[1].collectionID+'_'+ query.order[1].elementName;
        }


        tempResults.sort(
            firstBy(fieldName0,query.order[0].sortType*-1)
                .thenBy(fieldName1,query.order[1].sortType*-1)
        );
    }

    if (query.order.length == 3)
    {
        if (query.order[0].aggregation) {
            var fieldName0 = query.order[0].collectionID+'_'+ query.order[0].elementName+query.order[0].aggregation;
        } else {
            var fieldName0 = query.order[0].collectionID+'_'+ query.order[0].elementName;
        }

        if (query.order[1].aggregation) {
            var fieldName1 = query.order[1].collectionID+'_'+ query.order[1].elementName+query.order[1].aggregation;
        } else {
            var fieldName1 = query.order[1].collectionID+'_'+ query.order[1].elementName;
        }

        if (query.order[2].aggregation) {
            var fieldName2 = query.order[2].collectionID+'_'+ query.order[2].elementName+query.order[2].aggregation;
        } else {
            var fieldName2 = query.order[2].collectionID+'_'+ query.order[2].elementName;
        }

        tempResults.sort(
            firstBy(fieldName0)
                .thenBy(fieldName1)
                .thenBy(fieldName2)
        );
    }

    if (query.order.length == 4)
    {
        if (query.order[0].aggregation) {
            var fieldName0 = query.order[0].collectionID+'_'+ query.order[0].elementName+query.order[0].aggregation;
        } else {
            var fieldName0 = query.order[0].collectionID+'_'+ query.order[0].elementName;
        }

        if (query.order[1].aggregation) {
            var fieldName1 = query.order[1].collectionID+'_'+ query.order[1].elementName+query.order[1].aggregation;
        } else {
            var fieldName1 = query.order[1].collectionID+'_'+ query.order[1].elementName;
        }

        if (query.order[2].aggregation) {
            var fieldName2 = query.order[2].collectionID+'_'+ query.order[2].elementName+query.order[2].aggregation;
        } else {
            var fieldName2 = query.order[2].collectionID+'_'+ query.order[2].elementName;
        }

        if (query.order[3].aggregation) {
            var fieldName3 = query.order[3].collectionID+'_'+ query.order[3].elementName+query.order[3].aggregation;
        } else {
            var fieldName3 = query.order[3].collectionID+'_'+ query.order[3].elementName;
        }

        tempResults.sort(
            firstBy(fieldName0)
                .thenBy(fieldName1)
                .thenBy(fieldName2)
                .thenBy(fieldName3)
        );
    }

    if (query.order.length == 5)
    {
        if (query.order[0].aggregation) {
            var fieldName0 = query.order[0].collectionID+'_'+ query.order[0].elementName+query.order[0].aggregation;
        } else {
            var fieldName0 = query.order[0].collectionID+'_'+ query.order[0].elementName;
        }

        if (query.order[1].aggregation) {
            var fieldName1 = query.order[1].collectionID+'_'+ query.order[1].elementName+query.order[1].aggregation;
        } else {
            var fieldName1 = query.order[1].collectionID+'_'+ query.order[1].elementName;
        }

        if (query.order[2].aggregation) {
            var fieldName2 = query.order[2].collectionID+'_'+ query.order[2].elementName+query.order[2].aggregation;
        } else {
            var fieldName2 = query.order[2].collectionID+'_'+ query.order[2].elementName;
        }

        if (query.order[3].aggregation) {
            var fieldName3 = query.order[3].collectionID+'_'+ query.order[3].elementName+query.order[3].aggregation;
        } else {
            var fieldName3 = query.order[3].collectionID+'_'+ query.order[3].elementName;
        }

        if (query.order[4].aggregation) {
            var fieldName4 = query.order[4].collectionID+'_'+ query.order[4].elementName+query.order[4].aggregation;
        } else {
            var fieldName4 = query.order[4].collectionID+'_'+ query.order[4].elementName;
        }

        tempResults.sort(
            firstBy(fieldName0)
                .thenBy(fieldName1)
                .thenBy(fieldName2)
                .thenBy(fieldName3)
                .thenBy(fieldName4)
        );
    }

    done();

}

function mergeTwoCollections(collections,sourceCollection,sourceElement,targetCollection,targetElement,isLast, done )
{
    var tempResults = [];



    for (var collection in collections)
    {
        if (collections[collection].collectionID == sourceCollection)
        {
            var theSourceCollection =   collections[collection];
        }

        if (collections[collection].collectionID == targetCollection)
        {
            var theTargetCollection =   collections[collection];
        }
    }
    if (theSourceCollection && theTargetCollection )
    if (theSourceCollection.result && theTargetCollection.result )
    {
        var largestResult;
        var shortestResult;
        var largestElement;
        var shortestElement;

        //TODO: order by 1 is the short collection

        if (theSourceCollection.result.length > theTargetCollection.result.length)
        {
            largestResult = theSourceCollection.result;
            //largestElement = theSourceCollection.schema.collectionID.toLowerCase()+'_'+sourceElement;
            largestElement = sourceElement;
            shortestResult = theTargetCollection.result;
            //shortestElement = theTargetCollection.schema.collectionID.toLowerCase()+'_'+targetElement;
            shortestElement = targetElement;
        } else {
            largestResult = theTargetCollection.result;
            //largestElement = theTargetCollection.schema.collectionID.toLowerCase()+'_'+targetElement;
            largestElement = targetElement;
            shortestResult = theSourceCollection.result;
            //shortestElement = theSourceCollection.schema.collectionID.toLowerCase()+'_'+sourceElement;
            shortestElement = sourceElement;
        }


        for (var s in largestResult)
        {
            for (var t in shortestResult)
            {
                if (String(largestResult[s][largestElement]) == String(shortestResult[t][shortestElement]) && largestResult[s][largestElement] != undefined && shortestResult[t][shortestElement] != undefined)
                {
                    var tempRecord = {};
                    for (var key in largestResult[s])
                    {
                        //if (key != sourceElement)
                            tempRecord[key] = largestResult[s][key];
                    }

                    for (var key in shortestResult[t])
                    {
                        //if (key != targetElement)
                            tempRecord[key] = shortestResult[t][key];
                    }
                    tempResults.push(tempRecord);

                    //console.log('found',String(largestResult[s][largestElement]),String(shortestResult[t][shortestElement]));
                }
            }

        }



        if (isLast)
        {

            var theResult = {};
            theResult.result = 1;
            theResult.results = tempResults;
            done(theResult);
        } else {
            theSourceCollection.result = tempResults;
            theTargetCollection.result = tempResults;
            var theResult = {};
            theResult.result = 0;
            theResult.results = tempResults;
            done(theResult);
        }
    } else {
        var theResult = {};
        theResult.result = 0;
        theResult.results = undefined;

        done(theResult);
    } else {
        var theResult = {};
        theResult.result = 0;
        theResult.results = undefined;
        done(theResult);
    }


}

function executeDataSourceQuery(datasourceQuery,datasource,done)
{
    //identificar el tipo de datasource
    if (datasource.type == 'MONGODB')
    {
        executeMongoDBQuery(datasourceQuery,datasource,function(result){
               done(result);
        });
    }

}

function executeMongoDBQuery(datasourceQuery,datasource,done)
{
    var collections = [];
    var queryCollections = [];

    for (var i in datasourceQuery.collections) {
        if (queryCollections.indexOf(datasourceQuery.collections[i].collectionID) == -1)
        {
            queryCollections.push(datasourceQuery.collections[i].collectionID);
            var queryCollection = datasourceQuery.collections[i];

            for (var n in datasource.params[0].schema) {
                if (datasourceQuery.collections[i].collectionID == datasource.params[0].schema[n].collectionID)
                {
                collections.push(datasource.params[0].schema[n]);
                    executeMongoDBCollection(queryCollection,datasource,datasource.params[0].schema[n], function(result){
                             done(result);
                    });
                }
            }
        }
    }
}

function executeMongoDBCollection(queryCollection,datasource,collection,done)
{

    var fieldsToGet = {};

    var params = {};
    params['skip'] = 0;
    params['limit'] = 10;

    var filters = getMongoDBFilters(queryCollection.filters, collection);




    for (var i in queryCollection.columns) {
        //identificar el elemento de la colección
        for (var n in collection.elements) {
             if (queryCollection.columns[i].elementID == collection.elements[n].elementID)
             {
                 fieldsToGet[collection.elements[n].elementName] = 1;
             }
        }
    }

    var MongoClient = require('mongodb').MongoClient , assert = require('assert');

    var dbURI =  'mongodb://'+datasource.params[0].connection.host+':'+datasource.params[0].connection.port+'/'+datasource.params[0].connection.database;

    MongoClient.connect(dbURI, function(err, db) {
        if(err) { return console.dir(err); }


        var col = db.collection(collection.collectionName);

        col.find({$and:filters},fieldsToGet,params).toArray(function(err, docs) {

            done(docs);

            db.close();
        });
    });


}


function getMongoDBFilters(filters, collection)
{
    var theFilters = [];

    for (var i in filters) {

        for (var n in collection.elements) {
            if (filters[i].elementID == collection.elements[n].elementID) {
                var thisFilter = {};
                var filterElementName  =  collection.elements[n].elementName;

                if (filters[i].filterText1) {
                    if (filters[i].filterType == "equal") {
                        thisFilter[filterElementName] = filters[i].filterText1;
                    }
                    if (filters[i].filterType == "biggerThan") {
                        thisFilter[filterElementName] = {$gt: filters[i].filterText1};
                    }
                    if (filters[i].filterType == "notGreaterThan") {
                        thisFilter[filterElementName] = {$not: {$gt: filters[i].filterText1}};
                    }
                    if (filters[i].filterType == "biggerOrEqualThan") {
                        thisFilter[filterElementName] = {$gte: filters[i].filterText1};
                    }
                    if (filters[i].filterType == "lessThan") {
                        thisFilter[filterElementName] = {$lt: filters[i].filterText1};
                    }
                    if (filters[i].filterType == "lessOrEqualThan") {
                        thisFilter[filterElementName] = {$lte: filters[i].filterText1};
                    }
                    if (filters[i].filterType == "between") {
                        thisFilter[filterElementName] = {$gt: filters[i].filterText1, $lt: filters[i].filterText2};
                    }
                    if (filters[i].filterType == "notBetween") {
                        thisFilter[filterElementName] = {$not: {$gt: filters[i].filterText1, $lt: filters[i].filterText2}};
                    }
                    if (filters[i].filterType == "contains") {
                        thisFilter[filterElementName] = new RegExp(filters[i].filterText1, "i");
                    }
                    if (filters[i].filterType == "notContains") {
                        thisFilter[filterElementName] = {$ne: new RegExp(filters[i].filterText1, "i")};
                    }
                    if (filters[i].filterType == "startWith") {
                        thisFilter[filterElementName] = new RegExp('/^'+filters[i].filterText1+'/', "i");
                    }
                    if (filters[i].filterType == "notStartWith") {
                        thisFilter[filterElementName] = {$ne: new RegExp('/^'+filters[i].filterText1+'/', "i")};
                    }
                    if (filters[i].filterType == "endsWith") {
                        thisFilter[filterElementName] = new RegExp('/'+filters[i].filterText1+'$/', "i");
                    }
                    if (filters[i].filterType == "notEndsWith") {
                        thisFilter[filterElementName] = {$ne: new RegExp('/'+filters[i].filterText1+'$/', "i")};
                    }
                    if (filters[i].filterType == "like") {
                        thisFilter[filterElementName] = new RegExp('/'+filters[i].filterText1+'/', "i");
                    }
                    if (filters[i].filterType == "notLike") {
                        thisFilter[filterElementName] = {$ne: new RegExp('/'+filters[i].filterText1+'/', "i")};
                    }
                    if (filters[i].filterType == "null") {
                        thisFilter[filterElementName] = null;
                    }
                    if (filters[i].filterType == "notNull") {
                        thisFilter[filterElementName] = {$not: null};
                    }
                    if (filters[i].filterType == "in") {
                        thisFilter[filterElementName] = {$in: String(filters[i].filterText1).split(';')};
                    }
                    if (filters[i].filterType == "notIn") {
                        thisFilter[filterElementName] = {$nin: String(filters[i].filterText1).split(';')};
                    }
                }

                /*

                if (filters[i].filterType == "biggerThan")   //{ qty: { $gt: 25 } }  { price: { $not: { $gt: 1.99 } } }
                {
                    if (filters[i].filterText1)
                        thisFilter = {filterElementName: filters[i].filterText1}
                }

                {value:,label:"equal"},
                {value:"diferentThan",label:"diferent than"},
                 { item: { $not: valor } }
                {value:"biggerThan",label:"bigger than"},
                 { qty: { $gt: 25 } }
                {value:"biggerOrEqualThan",label:"bigger or equal than"},
                 { qty: { $gte: 25 } }
                {value:"lessThan",label:"less than"},
                 { qty: { $lt: 25 } }
                {value:"lessOrEqualThan",label:"less or equal than"},
                 { qty: { $lte: 25 } }
                {value:"between",label:"between"},
                 { field: { $gt: value1, $lt: value2 } }
                {value:"notBetween",label:"not between"},
                {value:"contains",label:"contains"},
                {value:"notContains",label:"not contains"},
                {value:"startWith",label:"start with"},
                {value:"notStartWith",label:"not start with"},

                {value:"endsWith",label:"ends with"},
                {value:"notEndsWith",label:"not ends with"},
                {value:"like",label:"como"},
                 db.users.find({"name": /.*m.*estoessinespaciolohepuestoporquelotomacomofindecometario/})
                {value:"notLike",label:"no como"},
                {value:"null",label:"is null"},
                 {sent_at: {$exists: false}}
                 {sent_at: null}
                {value:"notNull",label:"is not null"},
                {value:"in",label:"in"},
                 {
                 _id: { $in: [ 5,  ObjectId("507c35dd8fada716c89d0013") ] }
                 }


                {value:"notIn",label:"not in"}
                 {
                 _id: { $nin: [ 5,  ObjectId("507c35dd8fada716c89d0013") ] }
                 }
                */


                //TODO:Query a Field that Contains an Array
                //TODO:Subdocuments  http://docs.mongodb.org/manual/reference/method/db.collection.find/
                //if (!isEmpty(thisFilter)) {
                    theFilters.push(thisFilter);
                //}
            }
        }
    }

    return theFilters;
}

