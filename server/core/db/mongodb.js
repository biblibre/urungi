exports.processMongoDBCollections = function(collections, dataSource, done) {
    processMongoDBCollections(collections, dataSource, done);
};

function processMongoDBCollections(collections, dataSource, done, result, index) {
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

    console.log('the fields to get');
    debug(fields);

    var MongoClient = require('mongodb').MongoClient , assert = require('assert');

    var dbURI =  'mongodb://'+dataSource.params[0].connection.host+':'+dataSource.params[0].connection.port+'/'+dataSource.params[0].connection.database;

    MongoClient.connect(dbURI, function(err, db) {
        if(err) { return console.dir(err); }

        var col = db.collection(collection.schema.collectionName);
        var match = filters, project = {}, group = {}, fields = {};

        for (var i in collection.columns) {
            for (var e in collection.schema.elements) {
                if (collection.columns[i].elementID == collection.schema.elements[e].elementID) {

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
                }
            }
        }

        group['_id'] = fields;

        var params = [{ $match: match }];

        if (!isEmpty(project)) params.push({ $project: project });

        params.push({ $group: group });
        params.push({ $limit: 10 });

        console.log('params');
        debug(params);

        col.aggregate(params, function(err, docs) {
            console.log(docs);

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

                result.push(item);
            }
            debug(result);
            db.close();

            processMongoDBCollections(collections, dataSource, done, result, index+1);
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