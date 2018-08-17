const debug = require('debug')('urungi:server');

var Reports = connection.model('Reports');

const Controller = require('../../core/controller.js');
const QueryProcessor = require('../../core/queryProcessor');

class ReportsController extends Controller {
    constructor () {
        super(Reports);
        this.searchFields = ['reportName'];
    }
}

var controller = new ReportsController();

exports.ReportsFindAll = async function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';
    const result = await controller.findAll(req);
    serverResponse(req, res, 200, result);
};

exports.GetReport = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;

    controller.findOne(req, function (result) {
        serverResponse(req, res, 200, result);
        if ((req.query.mode === 'execute' || req.query.mode === 'preview') && result.item) {
            // Note the execution in statistics
            var statistics = connection.model('statistics');
            var stat = {};
            stat.type = 'report';
            stat.relationedID = result.item._id;
            stat.relationedName = result.item.reportName;

            if (req.query.linked === true) { stat.action = 'execute link'; } else { stat.action = 'execute'; }
            statistics.save(req, stat, function () {

            });
        }
    });
};

exports.ReportsFindOne = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;

    controller.findOne(req, function (result) {
        serverResponse(req, res, 200, result);
    });
};

exports.ReportsCreate = function (req, res) {
    if (!req.session.reportsCreate && !req.session.isWSTADMIN) {
        serverResponse(req, res, 401, {result: 0, msg: 'You do not have permissions to create reports'});
    } else {
        req.query.trash = true;
        req.query.companyid = true;
        req.query.userid = true;

        req.body.owner = req.user._id;
        req.body.isPublic = false;

        req.body.author = req.user.userName;

        controller.create(req, function (result) {
            serverResponse(req, res, 200, result);
        });
    }
};

exports.ReportsUpdate = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    var data = req.body;

    if (!req.session.isWSTADMIN) {
        var Reports = connection.model('Reports');
        Reports.findOne({_id: data._id, owner: req.user._id, companyID: req.user.companyID}, {_id: 1}, {}, function (err, item) {
            if (err) throw err;
            if (item) {
                controller.update(req, function (result) {
                    serverResponse(req, res, 200, result);
                });
            } else {
                serverResponse(req, res, 401, {result: 0, msg: 'You don´t have permissions to update this report, or this report do not exists'});
            }
        });
    } else {
        controller.update(req, function (result) {
            serverResponse(req, res, 200, result);
        });
    }
};

exports.PublishReport = function (req, res) {
    var data = req.body;
    var parentFolder = data.parentFolder;

    // have the connected user permissions to publish?
    var Reports = connection.model('Reports');
    var find = {_id: data._id, owner: req.user._id, companyID: req.user.companyID};

    if (req.session.isWSTADMIN) { find = {_id: data._id, companyID: req.user.companyID}; }

    Reports.findOne(find, {}, {}, function (err, report) {
        if (err) throw err;
        if (report) {
            report.parentFolder = parentFolder;
            report.isPublic = true;

            req.body = report;

            controller.update(req, function (result) {
                serverResponse(req, res, 200, result);
            });
        } else {
            serverResponse(req, res, 401, {result: 0, msg: 'You don´t have permissions to publish this report, or this report do not exists'});
        }
    });
};

exports.UnpublishReport = function (req, res) {
    var data = req.body;

    // TODO:tiene el usuario conectado permisos para publicar?
    var Reports = connection.model('Reports');
    var find = {_id: data._id, owner: req.user._id, companyID: req.user.companyID};

    if (req.session.isWSTADMIN) { find = {_id: data._id, companyID: req.user.companyID}; }

    Reports.findOne(find, {}, {}, function (err, report) {
        if (err) throw err;
        if (report) {
            report.isPublic = false;

            req.body = report;

            controller.update(req, function (result) {
                serverResponse(req, res, 200, result);
            });
        } else {
            serverResponse(req, res, 401, {result: 0, msg: 'You don´t have permissions to unpublish this report, or this report do not exists'});
        }
    });
};

exports.ReportsDelete = function (req, res) {
    var data = req.body;

    req.query.trash = true;
    req.query.companyid = true;

    data._id = data.id;
    data.nd_trash_deleted = true;
    data.nd_trash_deleted_date = new Date();

    req.body = data;

    if (!req.session.isWSTADMIN) {
        var Reports = connection.model('Reports');
        Reports.findOne({_id: data._id, owner: req.user._id}, {_id: 1}, {}, function (err, item) {
            if (err) throw err;
            if (item) {
                controller.remove(req, function (result) {
                    serverResponse(req, res, 200, result);
                });
            } else {
                serverResponse(req, res, 401, {result: 0, msg: 'You don´t have permissions to delete this report'});
            }
        });
    } else {
        controller.remove(req, function (result) {
            serverResponse(req, res, 200, result);
        });
    }
};

exports.PreviewQuery = function (req, res) {
    var data = req.query;
    var query = data.query;

    debug(query);

    processDataSources(query.datasources, query.layers, {}, query, function (result) {
        serverResponse(req, res, 200, result);
    });
};

exports.ReportsGetData = async function (req, res) {
    var data = req.body;
    var query = data.query;
    // processDataSources(req, query.datasources, query.layers, {page: (data.page) ? data.page : 1}, query, function (result) {
    //     serverResponse(req, res, 200, result);
    // });
    var result;
    try {
        result = await QueryProcessor.execute(query);
    } catch (err) {
        console.error(err);
        result = {result: 0, msg: (err.msg) ? err.msg : String(err), error: err};
    }
    serverResponse(req, res, 200, result);
};

function processDataSources (req, dataSources, layers, params, query, done, result, index) {
    index = index || 0;
    if (dataSources) { var dataSource = (dataSources[index]) ? dataSources[index] : false; }
    result = result || [];
    var thereAreJoins = false;

    if (!dataSource || typeof dataSource.datasourceID === 'undefined') {
        done(result);
        return;
    }

    var Layers = connection.model('Layers');
    Layers.find({ _id: {$in: layers} }, {}, function (err, theLayers) {
        if (err) { console.error(err); }

        if (theLayers) {
            var DataSources = connection.model('DataSources');

            DataSources.findOne({ _id: dataSource.datasourceID }, {}, function (err, dts) {
                if (err) { console.error(err); }

                if (dts) {
                    for (const layer of theLayers) {
                        for (const schemaColl of layer.params.schema) {
                            for (const collection of dataSource.collections) {
                                if (schemaColl.collectionID === collection.collectionID) {
                                    collection.schema = schemaColl;
                                }
                            }
                        }

                        for (const join of layer.params.joins) {
                            for (const collection of dataSource.collections) {
                                if (join.sourceCollectionID === collection.collectionID || join.targetCollectionID === collection.collectionID) {
                                    let theOther;
                                    if (join.sourceCollectionID === collection.collectionID) {
                                        theOther = join.targetCollectionID;
                                    } else {
                                        theOther = join.sourceCollectionID;
                                    }

                                    if (isTargetInvolved(dataSource.collections, theOther)) {
                                        if (!collection.joins) { collection.joins = []; }

                                        collection.joins.push(join);

                                        thereAreJoins = true;
                                    }
                                }
                            }
                        }
                    }

                    switch (dts.type) {
                    case 'MONGODB':
                        var mongodb = require('../../core/db/mongodb.js');

                        mongodb.processCollections(req, query, dataSource.collections, dts, params, thereAreJoins, function (data) {
                            if (dataSource.collections.length > 1) {
                                mergeResults(dataSource.collections, query, function (mergedResults) {
                                    var finalResult = {result: 1, data: mergedResults, sql: 'No SQL available for MongoDB'};
                                    result = finalResult;
                                });
                            } else {
                                var finalResult = {result: 1, data: dataSource.collections[0].result, sql: 'No SQL available for MongoDB'};
                                result = finalResult;
                            }

                            processDataSources(req, dataSources, layers, params, query, done, result, index + 1);
                        });
                        break;
                    case 'MySQL': case 'POSTGRE': case 'ORACLE': case 'MSSQL': case 'BIGQUERY': case 'JDBC-ORACLE':
                        var sql = require('../../core/db/sql.js');

                        sql.processCollections(req, query, dataSource.collections, dts, params, thereAreJoins, function (data) {
                            result = data;

                            processDataSources(req, dataSources, layers, params, query, done, result, index + 1);
                        });
                    }
                } else {
                    result = {result: 0, msg: 'This Datasource does not exists anymore! ' + dataSource.datasourceID};
                    processDataSources(req, dataSources, layers, params, query, done, result, index + 1);
                }
            });
        }
    });
}

function isTargetInvolved (collections, theOtherID) {
    var found = false;

    for (var collection in collections) {
        if (collections[collection].collectionID === theOtherID) { found = true; }
    }

    return found;
}

function mergeResults (collections, query, done) {
    var isLastCollection = false;
    var lastResults;
    for (var collection in collections) {
        if (collection === collections.length - 1) {
            isLastCollection = true;
            if (isLastCollection && collections[collection].joins.length === 0) {
                sortMergeResults(lastResults, query, function () {
                    done(lastResults);
                });
            }
        }
        for (var join in collections[collection].joins) {
            var isLast = false;
            if (join === collections[collection].joins.length - 1 && isLastCollection) {
                isLast = true;

                if (isLast && collections[collection].joins[join].sourceCollectionID !== collections[collection].collectionID) {
                    sortMergeResults(lastResults, query, function () {
                        done(lastResults);
                    });
                }
            }

            // sourceCollection
            if (collections[collection].joins[join].sourceCollectionID === collections[collection].collectionID) {
                var sourceCollection = collections[collection].joins[join].sourceCollectionID;
                // var sourceElement = collections[collection].joins[join].sourceElementName;
                var sourceElement = ('wst' + collections[collection].joins[join].sourceElementID.toLowerCase()).replace(/[^a-zA-Z ]/g, '');
                var targetCollection = collections[collection].joins[join].targetCollectionID;
                // var targetElement = collections[collection].joins[join].targetElementName;
                var targetElement = ('wst' + collections[collection].joins[join].targetElementID.toLowerCase()).replace(/[^a-zA-Z ]/g, '');

                // console.log('source element',sourceElement);
                // console.log('target element',targetElement);

                mergeTwoCollections(collections, sourceCollection, sourceElement, targetCollection, targetElement, isLast, function (result) {
                    if (result.result === 1) {
                        sortMergeResults(result.results, query, function () {
                            done(result.results);
                        });
                    } else {
                        if (result.results) { lastResults = result.results; }
                    }
                });
            }
        }
    }
}

function sortMergeResults (tempResults, query, done) {
    // Orderbys

    var firstBy = require('thenBy');

    if (query.order.length === 1) {
        let fieldName0;
        if (query.order[0].aggregation) {
            fieldName0 = query.order[0].collectionID + '_' + query.order[0].elementName + query.order[0].aggregation;
        } else {
            fieldName0 = query.order[0].collectionID + '_' + query.order[0].elementName;
        }

        tempResults.sort(
            firstBy(fieldName0, query.order[0].sortType * -1));
    }

    if (query.order.length === 2) {
        let fieldName0;
        if (query.order[0].aggregation) {
            fieldName0 = query.order[0].collectionID + '_' + query.order[0].elementName + query.order[0].aggregation;
        } else {
            fieldName0 = query.order[0].collectionID + '_' + query.order[0].elementName;
        }

        let fieldName1;
        if (query.order[1].aggregation) {
            fieldName1 = query.order[1].collectionID + '_' + query.order[1].elementName + query.order[1].aggregation;
        } else {
            fieldName1 = query.order[1].collectionID + '_' + query.order[1].elementName;
        }

        tempResults.sort(
            firstBy(fieldName0, query.order[0].sortType * -1)
                .thenBy(fieldName1, query.order[1].sortType * -1)
        );
    }

    if (query.order.length === 3) {
        let fieldName0;
        if (query.order[0].aggregation) {
            fieldName0 = query.order[0].collectionID + '_' + query.order[0].elementName + query.order[0].aggregation;
        } else {
            fieldName0 = query.order[0].collectionID + '_' + query.order[0].elementName;
        }

        let fieldName1;
        if (query.order[1].aggregation) {
            fieldName1 = query.order[1].collectionID + '_' + query.order[1].elementName + query.order[1].aggregation;
        } else {
            fieldName1 = query.order[1].collectionID + '_' + query.order[1].elementName;
        }

        let fieldName2;
        if (query.order[2].aggregation) {
            fieldName2 = query.order[2].collectionID + '_' + query.order[2].elementName + query.order[2].aggregation;
        } else {
            fieldName2 = query.order[2].collectionID + '_' + query.order[2].elementName;
        }

        tempResults.sort(
            firstBy(fieldName0)
                .thenBy(fieldName1)
                .thenBy(fieldName2)
        );
    }

    if (query.order.length === 4) {
        let fieldName0;
        if (query.order[0].aggregation) {
            fieldName0 = query.order[0].collectionID + '_' + query.order[0].elementName + query.order[0].aggregation;
        } else {
            fieldName0 = query.order[0].collectionID + '_' + query.order[0].elementName;
        }

        let fieldName1;
        if (query.order[1].aggregation) {
            fieldName1 = query.order[1].collectionID + '_' + query.order[1].elementName + query.order[1].aggregation;
        } else {
            fieldName1 = query.order[1].collectionID + '_' + query.order[1].elementName;
        }

        let fieldName2;
        if (query.order[2].aggregation) {
            fieldName2 = query.order[2].collectionID + '_' + query.order[2].elementName + query.order[2].aggregation;
        } else {
            fieldName2 = query.order[2].collectionID + '_' + query.order[2].elementName;
        }

        let fieldName3;
        if (query.order[3].aggregation) {
            fieldName3 = query.order[3].collectionID + '_' + query.order[3].elementName + query.order[3].aggregation;
        } else {
            fieldName3 = query.order[3].collectionID + '_' + query.order[3].elementName;
        }

        tempResults.sort(
            firstBy(fieldName0)
                .thenBy(fieldName1)
                .thenBy(fieldName2)
                .thenBy(fieldName3)
        );
    }

    if (query.order.length === 5) {
        let fieldName0;
        if (query.order[0].aggregation) {
            fieldName0 = query.order[0].collectionID + '_' + query.order[0].elementName + query.order[0].aggregation;
        } else {
            fieldName0 = query.order[0].collectionID + '_' + query.order[0].elementName;
        }

        let fieldName1;
        if (query.order[1].aggregation) {
            fieldName1 = query.order[1].collectionID + '_' + query.order[1].elementName + query.order[1].aggregation;
        } else {
            fieldName1 = query.order[1].collectionID + '_' + query.order[1].elementName;
        }

        let fieldName2;
        if (query.order[2].aggregation) {
            fieldName2 = query.order[2].collectionID + '_' + query.order[2].elementName + query.order[2].aggregation;
        } else {
            fieldName2 = query.order[2].collectionID + '_' + query.order[2].elementName;
        }

        let fieldName3;
        if (query.order[3].aggregation) {
            fieldName3 = query.order[3].collectionID + '_' + query.order[3].elementName + query.order[3].aggregation;
        } else {
            fieldName3 = query.order[3].collectionID + '_' + query.order[3].elementName;
        }

        let fieldName4;
        if (query.order[4].aggregation) {
            fieldName4 = query.order[4].collectionID + '_' + query.order[4].elementName + query.order[4].aggregation;
        } else {
            fieldName4 = query.order[4].collectionID + '_' + query.order[4].elementName;
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

function mergeTwoCollections (collections, sourceCollection, sourceElement, targetCollection, targetElement, isLast, done) {
    var tempResults = [];

    for (var collection in collections) {
        if (collections[collection].collectionID === sourceCollection) {
            var theSourceCollection = collections[collection];
        }

        if (collections[collection].collectionID === targetCollection) {
            var theTargetCollection = collections[collection];
        }
    }
    if (theSourceCollection && theTargetCollection) {
        if (theSourceCollection.result && theTargetCollection.result) {
            var largestResult;
            var shortestResult;
            var largestElement;
            var shortestElement;

            // TODO: order by 1 is the short collection

            if (theSourceCollection.result.length > theTargetCollection.result.length) {
                largestResult = theSourceCollection.result;
                // largestElement = theSourceCollection.schema.collectionID.toLowerCase()+'_'+sourceElement;
                largestElement = sourceElement;
                shortestResult = theTargetCollection.result;
                // shortestElement = theTargetCollection.schema.collectionID.toLowerCase()+'_'+targetElement;
                shortestElement = targetElement;
            } else {
                largestResult = theTargetCollection.result;
                // largestElement = theTargetCollection.schema.collectionID.toLowerCase()+'_'+targetElement;
                largestElement = targetElement;
                shortestResult = theSourceCollection.result;
                // shortestElement = theSourceCollection.schema.collectionID.toLowerCase()+'_'+sourceElement;
                shortestElement = sourceElement;
            }

            for (var s in largestResult) {
                for (var t in shortestResult) {
                    if (String(largestResult[s][largestElement]) === String(shortestResult[t][shortestElement]) && typeof largestResult[s][largestElement] !== 'undefined' && typeof shortestResult[t][shortestElement] !== 'undefined') {
                        var tempRecord = {};
                        for (const key in largestResult[s]) {
                        // if (key != sourceElement)
                            tempRecord[key] = largestResult[s][key];
                        }

                        for (const key in shortestResult[t]) {
                        // if (key != targetElement)
                            tempRecord[key] = shortestResult[t][key];
                        }
                        tempResults.push(tempRecord);

                    // console.log('found',String(largestResult[s][largestElement]),String(shortestResult[t][shortestElement]));
                    }
                }
            }

            if (isLast) {
                const theResult = {};
                theResult.result = 1;
                theResult.results = tempResults;
                done(theResult);
            } else {
                theSourceCollection.result = tempResults;
                theTargetCollection.result = tempResults;
                const theResult = {};
                theResult.result = 0;
                theResult.results = tempResults;
                done(theResult);
            }
        } else {
            const theResult = {};
            theResult.result = 0;
            theResult.results = undefined;

            done(theResult);
        }
    } else {
        const theResult = {};
        theResult.result = 0;
        theResult.results = undefined;
        done(theResult);
    }
}
