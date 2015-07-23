exports.testConnection = function(data, done) {
    var mongoose = require('mongoose');

    var dbURI =  'mongodb://'+data.host+':'+data.port+'/'+data.database;
    var conn = mongoose.createConnection(dbURI,{ server: { poolSize: 5 } });

    conn.on('connected', function () {
        console.log('Mongoose connection open to ' + dbURI);
        conn.db.collectionNames(function (err, names) {
            done({result: 1, items: names});
            conn.close();
        });
    });

    conn.on('error',function (err) {
        console.log('Mongoose default connection error: ' + err);
        done({result: 0, msg: 'Connection Error'});
    });
};

exports.getSchemas = function(data, done) {
    var collections = data.collections;
    var numDocs = data.numDocs; //number of documents scanned for every collection

    var MongoClient = require('mongodb').MongoClient , assert = require('assert');

    var dbURI =  'mongodb://'+data.host+':'+data.port+'/'+data.database;

    MongoClient.connect(dbURI, function(err, db) {
        if(err) { return console.dir(err); }

        var schemas = [];

        getCollectionSchema(db,collections,0,schemas, function() {
            console.log('--------------- está hecho');
            //console.log(schemas);
            done({result: 1, items: schemas});
        });

        //en la última iteración db.close();
    });
};

exports.execOperation = function(operation, params, done) {
    var DataSources = connection.model('DataSources');

    DataSources.findOne({ _id: params.datasourceID}, function (err, dataSource) {
        if (dataSource) {
            for (var n in dataSource.params[0].schema) {
                if (params.collectionID == dataSource.params[0].schema[n].collectionID) {
                    var MongoClient = require('mongodb').MongoClient , assert = require('assert');

                    var dbURI = 'mongodb://'+dataSource.params[0].connection.host+':'+dataSource.params[0].connection.port+'/'+dataSource.params[0].connection.database;

                    MongoClient.connect(dbURI, function(err, db) {
                        if(err) { return console.dir(err); }

                        var collection = db.collection(dataSource.params[0].schema[n].collectionName);

                        var fields = {};

                        if (params.fields) {
                            for (var i in params.fields) {
                                fields[params.fields] = 1;
                            }
                        }

                        if (operation == 'find') {
                            collection.find({}, fields, {limit: 50}).toArray(function(err, items) {
                                db.close();
                                done({result: 1, items: items});
                            });
                        }
                        if (operation == 'aggregate') {
                            collection.aggregate([
                                    { $group: { _id: params.group } },
                                    { $sort: params.sort },
                                    { $limit: 50 }
                                ],
                                function(err, result) {
                                    var items = [];

                                    for (var i in result) {
                                        if (result[i]._id[params.elementName]) {
                                            items.push(result[i]._id[params.elementName]);
                                        }
                                    }

                                    db.close();
                                    done({result: 1, items: items});
                                }
                            );
                        }
                    });
                }
            }
        } else {
            done({result: 0, msg: 'DataSource not found.'});
        }
    });
};

exports.processCollections = function(collections, dataSource, params, done) {
    processCollections(collections, dataSource, params, done);
};

function getCollectionSchema(db,collections,index,schemas, done) {
    if (collections[index] == undefined) {
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
        var dbstruc = {};
        var elements = [];

        for (var i = 0; i < results.length; i++) {
            //getKP(results[i],dbstruc);
            getElementList(results[i],elements,'');
        }

        var names = [];

        for (i = 0; i < elements.length; i++) {
            //console.log(elements[i]);
            var str = elements[i];
            if (str) {
                if (str != 'undefined') {
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

        schemas.push(theCollection);
        getCollectionSchema(db,collections,index+1,schemas, done);
    });
}

function getElementList (target,elements,parent) {
    for (var k in target) {
        if(typeof target[k] !== "object") {
            if (target.hasOwnProperty(k) ) {
                if (k >= 0) {
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
            }
        } else {
            if (target[k] && target[k][0] == 0) {
                //es un array
                console.log('SOY UN ARRAY');
            }

            if (parseInt(k) != k) {
                if (parent != '') {
                    var nodeDesc = parent+'.'+k+':'+typeof target[k];
                    var node = parent+'.'+k;
                } else {
                    var nodeDesc = k+':'+typeof target[k];
                    var node = k;
                }
            } else {
                var node = parent;
            }

            if (elements.indexOf(nodeDesc) == -1) {
                elements.push(nodeDesc);
                console.log(nodeDesc);
            }
            getElementList(target[k],elements,node);
        }
    }
}

function processCollections(collections, dataSource, params, done, result, index) {
    var index = (index) ? index : 0;
    var collection = (collections[index]) ? collections[index] : false;
    var result = (result) ? result : [];

    if (!collection) {
        done(result);
        return;
    }

    console.log('entering mongoDB collections');
    var fields = {};

    var filters = getCollectionFilters(collection, collection.filters);

    console.log('the Filters');
    debug(filters);

    for (var i in collection.columns) {
        for (var e in collection.schema.elements) {
            if (collection.columns[i].elementID == collection.schema.elements[e].elementID) {
                fields[collection.schema.elements[e].elementName] = 1;
            }
        }
    }

    var sort = {};

    if (collection.order) {
        for (var i in collection.order) {
            for (var e in collection.schema.elements) {
                if (collection.order[i].elementID == collection.schema.elements[e].elementID) {
                    sort[collection.schema.elements[e].elementName] = collection.order[i].sortType;
                }
            }
        }
    }

    console.log('the fields to get');
    debug(fields);

    var MongoClient = require('mongodb').MongoClient , assert = require('assert');

    var dbURI =  'mongodb://'+dataSource.params[0].connection.host+':'+dataSource.params[0].connection.port+'/'+dataSource.params[0].connection.database;

    MongoClient.connect(dbURI, function(err, db) {
        if(err) { return console.dir(err); }

        var col = db.collection(collection.schema.collectionName);
        var match = filters, project = {}, group = {}, fields = {};

        for (var i in collection.columns) {
            var found = false;

            for (var e in collection.schema.elements) {
                if (collection.columns[i].elementID == collection.schema.elements[e].elementID) {
                    found = true;

                    if (collection.columns[i].aggregation) {
                        switch (collection.columns[i].aggregation) {
                            case 'sum': group[collection.schema.elements[e].elementName+'sum'] = {$sum: "$"+collection.schema.elements[e].elementName};
                                break;
                            case 'avg': group[collection.schema.elements[e].elementName+'avg'] = {$avg: "$"+collection.schema.elements[e].elementName};
                                break;
                            case 'min': group[collection.schema.elements[e].elementName+'min'] = {$min: "$"+collection.schema.elements[e].elementName};
                                break;
                            case 'max': group[collection.schema.elements[e].elementName+'max'] = {$max: "$"+collection.schema.elements[e].elementName};
                                break;
                            case 'year': project[collection.schema.elements[e].elementName+'year'] = {$year: "$"+collection.schema.elements[e].elementName};
                                break;
                            case 'month': project[collection.schema.elements[e].elementName+'month'] = {$month: "$"+collection.schema.elements[e].elementName};
                                break;
                            case 'day': project[collection.schema.elements[e].elementName+'day'] = {$dayOfMonth: "$"+collection.schema.elements[e].elementName};
                        }
                    }
                    else {
                        fields[collection.schema.elements[e].elementName] = "$"+collection.schema.elements[e].elementName;
                    }

                    if (collection.columns[i].variable) {
                        switch (collection.columns[i].variable) {
                            case 'toUpper': project[collection.schema.elements[e].elementName] = {$toUpper: "$"+collection.schema.elements[e].elementName};
                                break;
                            case 'toLower': project[collection.schema.elements[e].elementName] = {$toLower: "$"+collection.schema.elements[e].elementName};
                        }
                    }
                    else { //es necesario añadir todos los campos a project si hay alguna variable, si solo se añaden los campos con variable, el resto no se devuelven en la consulta
                        project[collection.schema.elements[e].elementName] = "$"+collection.schema.elements[e].elementName;
                    }
                }
            }

            if (!found) {
                if (collection.columns[i].count) {
                    group['count'] = { $sum: 1 };
                }
            }
        }

        group['_id'] = fields;

        var aggregation = [{ $match: match }];

        if (!isEmpty(project)) aggregation.push({ $project: project });

        if (!isEmpty(sort)) aggregation.push({ $sort: sort });

        aggregation.push({ $group: group });

        if (params.page) {
            aggregation.push({ $skip: (params.page-1)*100 });
            aggregation.push({ $limit: 100 });
        }
        else {
            aggregation.push({ $limit: 10 });
        }

        console.log('aggregation');
        debug(aggregation);

        col.aggregate(aggregation, function(err, docs) {
            for (var i in docs) {
                var item = {};

                for(var group in docs[i]) {
                    if (group == '_id') {
                        for(var field in docs[i][group]) {
                            item[field] = docs[i][group][field];
                        }
                    }
                    else {
                        item[group] = docs[i][group];
                    }
                }

                for (var field in item) {
                    for (var e in collection.schema.elements) {
                        if (field == collection.schema.elements[e].elementName && collection.schema.elements[e].values) {
                            for (var v in collection.schema.elements[e].values) {
                                if (collection.schema.elements[e].values[v].value == item[field]) {
                                    item[field] = collection.schema.elements[e].values[v].label;
                                }
                            }
                        }
                        if (field == collection.schema.elements[e].elementName && collection.schema.elements[e].format) {
                            if (collection.schema.elements[e].elementType == 'date') {
                                var date = new Date(item[field]);

                                item[field] = collection.schema.elements[e].format;
                                item[field] = String(item[field]).replace('DD', date.getDate());
                                item[field] = String(item[field]).replace('MM', date.getMonth()+1);
                                item[field] = String(item[field]).replace('YYYY', date.getFullYear());
                            }

                        }
                    }
                }

                result.push(item);
            }
            //debug(result);
            db.close();

            processCollections(collections, dataSource, params, done, result, index+1);
        });
    });
}

function getCollectionFilters(collection, filters) {
    var theFilters = [], condition = false;

    console.log('getCollectionFilters');
    debug(filters);

    for (var i in filters) {
        var filter = filters[i];

        if (filter.group) {
            console.log('es grupo');
            theFilters.push(getCollectionFilters(collection, filter.filters));
        }
        else if (filter.condition) {
            if (!condition) condition = filter.conditionType;
        }
        else if (filter.filterText1 || filter.filterType == 'notNull' || filter.filterType == 'null' ) {
            for (var e in collection.schema.elements) {
                if (filter.elementID == collection.schema.elements[e].elementID) {
                    var thisFilter = {}, filterValue = filter.filterText1;
                    var filterElementName = collection.schema.elements[e].elementName;

                    if (collection.schema.elements[e].elementType == 'number') {
                        filterValue = Number(filterValue);
                    }

                    if (filter.filterType == "equal") {
                        thisFilter[filterElementName] = filterValue;
                    }
                    if (filter.filterType == "biggerThan") {
                        thisFilter[filterElementName] = {$gt: filterValue};
                    }
                    if (filter.filterType == "notGreaterThan") {
                        thisFilter[filterElementName] = {$not: {$gt: filterValue}};
                    }
                    if (filter.filterType == "biggerOrEqualThan") {
                        thisFilter[filterElementName] = {$gte: filterValue};
                    }
                    if (filter.filterType == "lessThan") {
                        thisFilter[filterElementName] = {$lt: filterValue};
                    }
                    if (filter.filterType == "lessOrEqualThan") {
                        thisFilter[filterElementName] = {$lte: filterValue};
                    }
                    if (filter.filterType == "between") {
                        thisFilter[filterElementName] = {$gt: filterValue, $lt: filter.filterText2};
                    }
                    if (filter.filterType == "notBetween") {
                        thisFilter[filterElementName] = {$not: {$gt: filterValue, $lt: filter.filterText2}};
                    }
                    if (filter.filterType == "contains") {
                        thisFilter[filterElementName] = new RegExp(filterValue, "i");
                    }
                    if (filter.filterType == "notContains") {
                        thisFilter[filterElementName] = {$ne: new RegExp(filterValue, "i")};
                    }
                    if (filter.filterType == "startWith") {
                        thisFilter[filterElementName] = new RegExp('/^'+filterValue+'/', "i");
                    }
                    if (filter.filterType == "notStartWith") {
                        thisFilter[filterElementName] = {$ne: new RegExp('/^'+filterValue+'/', "i")};
                    }
                    if (filter.filterType == "endsWith") {
                        thisFilter[filterElementName] = new RegExp('/'+filterValue+'$/', "i");
                    }
                    if (filter.filterType == "notEndsWith") {
                        thisFilter[filterElementName] = {$ne: new RegExp('/'+filterValue+'$/', "i")};
                    }
                    if (filter.filterType == "like") {
                        thisFilter[filterElementName] = new RegExp('/'+filterValue+'/', "i");
                    }
                    if (filter.filterType == "notLike") {
                        thisFilter[filterElementName] = {$ne: new RegExp('/'+filterValue+'/', "i")};
                    }
                    if (filter.filterType == "null") {
                        thisFilter[filterElementName] = null;
                    }
                    if (filter.filterType == "notNull") {
                        thisFilter[filterElementName] = {$ne: null};
                    }
                    if (filter.filterType == "in") {
                        thisFilter[filterElementName] = {$in: String(filterValue).split(';')};
                    }
                    if (filter.filterType == "notIn") {
                        thisFilter[filterElementName] = {$nin: String(filterValue).split(';')};
                    }

                    if (!isEmpty(thisFilter)) {
                        theFilters.push(thisFilter);
                    }
                }
            }
        }
    }

    if (theFilters.length > 0) {
        switch(condition) {
            case 'and': return {$and: theFilters};
                break;
            case 'or': return {$or: theFilters};
                break;
            case 'andNot': return {$not: theFilters};
                break;
            case 'orNot': return {$nor: theFilters};
                break;
            default: return {$and: theFilters};
        }
    }
    else return {};
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}