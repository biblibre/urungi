exports.testConnection = function(req,data, done) {
    var mongoose = require('mongoose');


    if (data.userName)  //data.userName+':'+data.password
        var dbURI =  'mongodb://'+data.userName+':'+data.password+'@'+data.host+':'+data.port+'/'+data.database;
        else
        var dbURI =  'mongodb://'+data.host+':'+data.port+'/'+data.database;

    var conn = mongoose.createConnection(dbURI,{ server: { poolSize: 5 } });

    conn.on('connected', function () {
        console.log('mongodb connected, getting collection names');
        conn.db.listCollections().toArray(function (err, names) {
            if (err)
                {
                    console.log(err);
                    done({result:0, msg: err});
                    conn.close();
                } else {
                    done({result: 1, items: names});
                    conn.close();
                }
        });
    });

    conn.on('error',function (err) {
        console.log('Mongoose default connection error: ' + err);
        done({result: 0, msg: 'Connection Error'});
    });
};

exports.getSchemas = function(data, done) {
    var collections = data.entities;
   var MongoClient = require('mongodb').MongoClient , assert = require('assert');

    if (data.userName)  //data.userName+':'+data.password
        var dbURI =  'mongodb://'+data.userName+':'+data.password+'@'+data.host+':'+data.port+'/'+data.database;
        else
        var dbURI =  'mongodb://'+data.host+':'+data.port+'/'+data.database;

    MongoClient.connect(dbURI, function(err, db) {
        if(err) { return console.dir(err); }

        var schemas = [];

        getCollectionSchema(db,collections,0,schemas, function() {
            done({result: 1, items: schemas});
        });
    });
};

exports.execOperation = function(operation, params, done) {
    var DataSources = connection.model('DataSources');


    DataSources.findOne({ _id: params.datasourceID}, function (err, dataSource) {
        if (dataSource) {

                        var theCollectionName = '';
                        theCollectionName = params.collectionName;


                                var MongoClient = require('mongodb').MongoClient , assert = require('assert');
                                if (dataSource.params[0].connection.userName)  //data.userName+':'+data.password
                                    var dbURI =  'mongodb://'+dataSource.params[0].connection.userName+':'+dataSource.params[0].connection.password+'@'+dataSource.params[0].connection.host+':'+dataSource.params[0].connection.port+'/'+dataSource.params[0].connection.database;
                                    else
                                    var dbURI = 'mongodb://'+dataSource.params[0].connection.host+':'+dataSource.params[0].connection.port+'/'+dataSource.params[0].connection.database;

                                MongoClient.connect(dbURI, function(err, db) {
                                    if(err) { return console.dir(err); }

                                    var collection = db.collection(theCollectionName);

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
                                                /*
                                                var items = [];

                                                for (var i in result) {
                                                    //if (result[i]._id[params.elementName]) {
                                                        items.push(result[i]._id[params.elementName]);

                                                    //}
                                                } */
                                                db.close();
                                                done({result: 1, items: result});
                                            }
                                        );
                                    }
                                });

                    } else {
                        done({result: 0, msg: 'DataSource not found: '});
                    }

            });


};

exports.processCollections = function(req,query,collections, dataSource, params,thereAreJoins, done) {
    processCollections(req,query,collections, dataSource, params,thereAreJoins, done);
};




function getCollectionSchema(db,collections,index,schemas, done) {
    if (collections[index] == undefined) {
        done();
        return;
    }

    var uuid = require('node-uuid');
    var collectionName = collections[index].name;
    var collectionID = 'WST'+uuid.v4();


    collectionID =  collectionID.replace(new RegExp('-', 'g'), '');
    var theCollection = {collectionID: collectionID ,collectionName: collectionName,visible:true,collectionLabel:collectionName};
    theCollection.elements = [];

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
                     var node = parent+'.'+k+':array';
                     } else {
                     var node = k+':array';
                     }
                     */
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
            if (target[k] && target[k][0] == 0) {

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

            }
            getElementList(target[k],elements,node);
        }
    }
}

/*
function getFilterJoins(collection, filters) {
    var theFields = [];
    for (var i in filters) {
        var filter = filters[i];

        if (filter.group) {

            theFilters.push(getFilterJoins(collection, filter.filters));
        }

        if filter
    }


}
  */


function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}



function getCollectionFiltersV2(collection, filters) {
    var theFilters = [], condition = 'AND';


    for (var i in filters) {
        if (filters[i].collectionID == collection.collectionID)
            {
                var filter = filters[i];

                if (filter.group) {

                    theFilters.push(getCollectionFilters(collection, filter.filters));
                }
                else if (filter.filterText1 || filter.filterType == 'notNull' || filter.filterType == 'null' ) {


                    for (var e in collection.schema.elements) {

                       if (filter.elementID == collection.schema.elements[e].elementID) {
                            var thisFilter = {}, filterValue = filter.filterText1;
                            var filterElementName = collection.schema.elements[e].elementName;



                            if (collection.schema.elements[e].elementType == 'number') {
                                filterValue = Number(filterValue);
                            }
                            if (collection.schema.elements[e].elementType == 'date') {

                                if (filter.filterType == "in" || filter.filterType == "notIn")
                                {
                                   thisFilter = dateFilter(filterValue,filter);
                                } else {
                                    thisFilter[filterElementName] = dateFilter(filterValue,filter);
                                }
                            }

                            if (filter.filterType == "equal" && filter.elementType != 'date') {
                                thisFilter[filterElementName] = filterValue;
                            }
                            if (filter.filterType == "diferentThan" && filter.elementType != 'date') {
                                thisFilter[filterElementName] = {$not: filterValue};;
                            }
                            if (filter.filterType == "biggerThan" && filter.elementType != 'date' ) {
                                thisFilter[filterElementName] = {$gt: filterValue};
                            }
                            if (filter.filterType == "notGreaterThan" && filter.elementType != 'date') {
                                thisFilter[filterElementName] = {$not: {$gt: filterValue}};
                            }
                            if (filter.filterType == "biggerOrEqualThan" && filter.elementType != 'date') {
                                thisFilter[filterElementName] = {$gte: filterValue};
                            }
                            if (filter.filterType == "lessThan" && filter.elementType != 'date') {
                                thisFilter[filterElementName] = {$lt: filterValue};
                            }
                            if (filter.filterType == "lessOrEqualThan" && filter.elementType != 'date') {
                                thisFilter[filterElementName] = {$lte: filterValue};
                            }
                            if (filter.filterType == "between" && filter.elementType != 'date') {
                                thisFilter[filterElementName] = {$gt: filterValue, $lt: filter.filterText2};
                            }
                            if (filter.filterType == "notBetween" && filter.elementType != 'date') {
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
                            if (filter.filterType == "in"  && filter.elementType != 'date') {
                                thisFilter[filterElementName] = {$in: String(filterValue).split(';')};     //;
                            }
                            if (filter.filterType == "notIn" && filter.elementType != 'date') {
                                thisFilter[filterElementName] = {$nin: String(filterValue).split(';')};
                            }

                            if (!isEmpty(thisFilter)) {

                                if (filter.conditionLabel)
                                    {
                                        var pushCondition = [];
                                        pushCondition.push(thisFilter);

                                        condition = filter.conditionLabel;

                                        switch(filter.conditionLabel) {
                                            case 'AND': theFilters.push({$and: pushCondition});
                                                break;
                                            case 'OR': theFilters.push({$or:  pushCondition});
                                                break;
                                            case 'AND NOT': theFilters.push({$not:  pushCondition});
                                                break;
                                            case 'OR NOT': theFilters.push({$nor: pushCondition});
                                                break;
                                            default: theFilters.push({$and:  pushCondition});
                                        }
                                        //theFilters.push(thisFilter);
                                    } else {
                                        theFilters.push(thisFilter);
                                    }
                            }
                        }
                    }
                }
        }
    }

    if (theFilters.length > 0) {
        switch(condition) {
            case 'AND': return {$and: theFilters};
                break;
            case 'OR': return {$or: theFilters};
                break;
            case 'AND NOT': return {$not: theFilters};
                break;
            case 'OR NOT': return {$nor: theFilters};
                break;
            default: return {$and: theFilters};
        }
    }
    else return {};
}


function dateFilter(filterValue, filter)
{
    //This is not valid for date-time values... the equal always take the hole day without taking care about the time


    var today = new Date();
    var year = today.getFullYear();
    var month = pad(today.getMonth()+1,2);
    var day = pad(today.getDate(),2);

    var found = false;

    if (filterValue == '#WST-TODAY#')
    {
        var firstDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate()+1);
        var year1 = tomorrow.getFullYear();
        var month1 = pad(tomorrow.getMonth()+1,2);
        var day1 = pad(tomorrow.getDate(),2);

        var lastDate = new Date(year1+'-'+month1+'-'+day1+'T00:00:00.000Z');
        found = true;

    }

    if (filterValue == '#WST-YESTERDAY#')
    {
        var lastDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
        var yesterday = new Date(today);
        yesterday.setDate(today.getDate()-1);
        var year1 = yesterday.getFullYear();
        var month1 = pad(yesterday.getMonth()+1,2);
        var day1 = pad(yesterday.getDate(),2);

        var firstDate = new Date(year1+'-'+month1+'-'+day1+'T00:00:00.000Z');
        found = true;

    }

    if (filterValue == '#WST-THISWEEK#')
    {   //TODO: first day monday instead sunday
        var curr = new Date; // get current date
        curr.setHours(0, 0, 0, 0);
        var first = curr.getDate() - (curr.getDay()-1); // First day is the day of the month - the day of the week
        var last = first + 7; // last day is the first day + 6 one more day 7 because is a less than

        var firstDate = new Date(curr.setDate(first));
        var lastDate = new Date(curr.setDate(last));
        found = true;

    }

    if (filterValue == '#WST-LASTWEEK#')
    {   //TODO: first day monday instead sunday
        var curr = new Date; // get current date
        curr.setHours(0, 0, 0, 0);
        var lwday = new Date(curr);
        lwday.setDate(curr.getDate()-7);

        var first = lwday.getDate() - (lwday.getDay()-1); // First day is the day of the month - the day of the week
        var last = first + 7; // last day is the first day + 6 one more day 7 because is a less than

        var firstDate = new Date(curr.setDate(first));
        var lastDate = new Date(curr.setDate(last));
        found = true;

    }

    if (filterValue == '#WST-THISMONTH#')
    {

        var firstDate = new Date(year+'-'+month+'-01T00:00:00.000Z');

        if (month == 12)
            var lastDate = new Date((year+1)+'-01-01T00:00:00.000Z');
        else
        {
            var month1 = pad(today.getMonth()+2,2);
            var lastDate = new Date(year+'-'+month1+'-01T00:00:00.000Z');
        }
        found = true;

    }

    if (filterValue == '#WST-LASTMONTH#')
    {

        if (month == 1)
            var firstDate = new Date((year-1)+'-12-01T00:00:00.000Z');
        else {
            var month1 = pad(today.getMonth(),2);
            var firstDate = new Date(year+'-'+month1+'-01T00:00:00.000Z');
        }

        var lastDate = new Date(year+'-'+month+'-01T00:00:00.000Z');
        found = true;

    }

    if (filterValue == '#WST-THISYEAR#')
    {
        var firstDate = new Date(year+'-01-01T00:00:00.000Z');
        var lastDate = new Date((year+1)+'-01-01T00:00:00.000Z');
        found = true;

    }

    if (filterValue == '#WST-LASTYEAR#')
    {
        var firstDate = new Date((year-1)+'-01-01T00:00:00.000Z');
        var lastDate = new Date((year)+'-01-01T00:00:00.000Z');
        found = true;

    }
    if (filterValue == '#WST-FIRSTQUARTER#')
    {
        var firstDate = new Date(year+'-01-01T00:00:00.000Z');
        var lastDate = new Date(year+'-04-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-SECONDQUARTER#')
    {
        var firstDate = new Date(year+'-04-01T00:00:00.000Z');
        var lastDate = new Date(year+'-07-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-THIRDQUARTER#')
    {
        var firstDate = new Date(year+'-07-01T00:00:00.000Z');
        var lastDate = new Date(year+'-10-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-FOURTHQUARTER#')
    {
        var firstDate = new Date(year+'-10-01T00:00:00.000Z');
        var lastDate = new Date((year+1)+'-01-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-FIRSTSEMESTER#')
    {
        var firstDate = new Date(year+'-01-01T00:00:00.000Z');
        var lastDate = new Date(year+'-07-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-SECONDSEMESTER#')
    {
        var firstDate = new Date(year+'-07-01T00:00:00.000Z');
        var lastDate = new Date((year+1)+'-01-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYFIRSTQUARTER#')
    {
        var firstDate = new Date((year-1)+'-01-01T00:00:00.000Z');
        var lastDate = new Date((year-1)+'-04-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYSECONDQUARTER#')
    {
        var firstDate = new Date((year-1)+'-04-01T00:00:00.000Z');
        var lastDate = new Date((year-1)+'-07-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYTHIRDQUARTER#')
    {
        var firstDate = new Date((year-1)+'-07-01T00:00:00.000Z');
        var lastDate = new Date((year-1)+'-10-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYFOURTHQUARTER#')
    {
        var firstDate = new Date((year-1)+'-10-01T00:00:00.000Z');
        var lastDate = new Date(year+'-01-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYFIRSTSEMESTER#')
    {
        var firstDate = new Date((year-1)+'-01-01T00:00:00.000Z');
        var lastDate = new Date((year-1)+'-07-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYSECONDSEMESTER#')
    {
        var firstDate = new Date((year-1)+'-07-01T00:00:00.000Z');
        var lastDate = new Date(year+'-01-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (found == true)
    {
        if (filter.filterType == "equal")
            return {$gte: firstDate, $lt: lastDate};
        if (filter.filterType == "diferentThan")
            return {$not: {$gte: firstDate, $lt: lastDate}};
        if (filter.filterType == "biggerThan")
            return {$gt: lastDate};
        if (filter.filterType == "biggerOrEqualThan" )
            return {$gte: firstDate};
        if (filter.filterType == "lessThan" )
            return {$lt: firstDate};
        if (filter.filterType == "lessOrEqualThan" )
            return {$lt: lastDate};
    } else {

        if (filter.filterType == "equal" )
        {
            var searchDate = new Date(filterValue);
            var theNextDay = new Date(searchDate);
            theNextDay.setDate(searchDate.getDate()+1);
            return {$gte: searchDate, $lt: theNextDay};
        }

        if (filter.filterType == "diferentThan" && found == false)
        {
            var searchDate = new Date(filterValue);
            var theNextDay = new Date(searchDate);
            theNextDay.setDate(searchDate.getDate()+1);
            return {$not:{$gte: searchDate, $lt: theNextDay}};
        }

        if (filter.filterType == "biggerThan" )
        {
            var searchDate = new Date(filterValue);
            var theNextDay = new Date(searchDate);
            theNextDay.setDate(searchDate.getDate()+1);
            return {$gt: theNextDay}

        }

        if (filter.filterType == "notGreaterThan" )
        {
            var searchDate = new Date(filterValue);
            var theNextDay = new Date(searchDate);
            theNextDay.setDate(searchDate.getDate()+1);
            return {$not:{$gt: theNextDay}}

        }

        if (filter.filterType == "biggerOrEqualThan" )
        {
            var searchDate = new Date(filterValue);
            return {$gte: searchDate}

        }

        if (filter.filterType == "lessThan" )
        {
            var searchDate = new Date(filterValue);
            return {$lt: searchDate}

        }

        if (filter.filterType == "lessOrEqualThan" )
        {
            var searchDate = new Date(filterValue);
            var theNextDay = new Date(searchDate);
            theNextDay.setDate(searchDate.getDate()+1);
            return {$lt: theNextDay}

        }

        if (filter.filterType == "between" )
        {
            var searchDate = new Date(filterValue);
            //searchDate.setHours(0, 0, 0, 0);
            var lastDate = new Date(filter.filterText2);
            /*
            var theNextDay = new Date(lastDate);
            theNextDay.setDate(lastDate.getDate()+1);
            */

            return {$gte: searchDate, $lt: lastDate};

        }

        if (filter.filterType == "notBetween" )
        {
            var searchDate = new Date(filterValue);
            var lastDate = new Date(filter.filterText2);
            return {$not:{$gte: searchDate, $lt: lastDate}};

        }

        if (filter.filterType == "in" )
        {
            var theFilter = [];
            var dates = String(filterValue).split(',');
            for (var d in dates)
            {
                var theDate = new Date(dates[d]);
                var theNextDay = new Date(theDate);
                theNextDay.setDate(theDate.getDate()+1);
                var theElementName = filter.elementName;
                var inFilter = {};
                inFilter[filter.elementName] = {$gte: theDate, $lt: theNextDay};
                theFilter.push(inFilter);
            }

            return {$or: theFilter};

        }

        if (filter.filterType == "notIn" )
        {

            var theFilter = [];
            var dates = String(filterValue).split(',');
            for (var d in dates)
            {
                var theDate = new Date(dates[d]);
                var theNextDay = new Date(theDate);
                theNextDay.setDate(theDate.getDate()+1);
                var theElementName = filter.elementName;
                var inFilter = {};
                inFilter[filter.elementName] = {$gte: theDate, $lt: theNextDay};
                theFilter.push(inFilter);
            }

            return {$nor: theFilter};

        }

    }
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

function processCollections(req,query,collections, dataSource, params, thereAreJoins, done,  index) {
    var index = (index) ? index : 0;
    var collection = (collections[index]) ? collections[index] : false;
    var result = (result) ? result : [];

    if (!collection) {
        done();
        return;
    }

    //No pagination when there are joins as all data is processed
    if (thereAreJoins && params.page > 1 )
        {
        done();
        return;
        }



   var fields = {};


    var filters = getCollectionFiltersV2(collection, query.groupFilters);



    for (var i in collection.columns) {
        for (var e in collection.schema.elements) {
            if (collection.columns[i].elementID == collection.schema.elements[e].elementID) {
                fields[collection.schema.elements[e].elementName] = 1;
            }
        }
    }

    //ADD the necessary fields for joins
    for (var i in collection.joins) {
            if (collection.joins[i].sourceCollectionID == collection.collectionID)
                fields[collection.joins[i].sourceElementName] = 1;
            if (collection.joins[i].targetCollectionID == collection.collectionID)
                fields[collection.joins[i].targetElementName] = 1;

    }


    var sort = {};

    if (collection.order) {

        for (var i in collection.order) {

            for (var e in collection.schema.elements) {
                if (collection.order[i] != undefined)
                {
                    if (collection.order[i].elementID == collection.schema.elements[e].elementID) {

                        var found = false;

                        for (var c in collection.columns) {
                            if (collection.columns[c].elementID == collection.schema.elements[e].elementID) {


                                if (collection.columns[c].aggregation) {
                                    found = true;
                                    switch (collection.columns[c].aggregation) {
                                        case 'sum': sort[collection.schema.elements[e].elementName+'sum'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'avg': sort[collection.schema.elements[e].elementName+'avg'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'min': sort[collection.schema.elements[e].elementName+'min'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'max': sort[collection.schema.elements[e].elementName+'max'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'count': sort[collection.schema.elements[e].elementName+'count'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'year': sort['_id.'+collection.schema.elements[e].elementName+'year'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'month': sort['_id.'+collection.schema.elements[e].elementName+'month'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'day': sort['_id.'+collection.schema.elements[e].elementName+'day'] = collection.order[i].sortType*-1;
                                    }
                                }

                                break;
                            }
                        }
                        if (!found) {
                            if (collection.order[i].sortType)
                                sort['_id.'+collection.schema.elements[e].elementName] = collection.order[i].sortType*-1;
                            else
                                sort['_id.'+collection.schema.elements[e].elementName] = 1;
                        }
                    }
                }
            }
        }
    }



    var MongoClient = require('mongodb').MongoClient , assert = require('assert');

    if (dataSource.params[0].connection.userName)  //data.userName+':'+data.password
        var dbURI =  'mongodb://'+dataSource.params[0].connection.userName+':'+dataSource.params[0].connection.password+'@'+dataSource.params[0].connection.host+':'+dataSource.params[0].connection.port+'/'+dataSource.params[0].connection.database;
        else
        var dbURI =  'mongodb://'+dataSource.params[0].connection.host+':'+dataSource.params[0].connection.port+'/'+dataSource.params[0].connection.database;

    MongoClient.connect(dbURI, function(err, db) {
        if(err) { return console.dir(err); }

        var col = db.collection(collection.schema.collectionName);
        var match = filters, project = {}, group = {}, fields = {};

        for (var i in collection.columns) {
            var found = false;


            if (collection.columns[i].elementName == 'WSTcount'+collection.schema.collectionName) {
                group['WSTcount'+collection.schema.collectionName] = { $sum: 1 };

            } else {
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
                            case 'count': group[collection.schema.elements[e].elementName+'count'] = {$sum: 1};
                                break;
                            case 'year': {

                                    if (collection.schema.elements[e].extractFromString == true)
                                    {
                                        project[collection.schema.elements[e].elementName+'year'] = {"$substr" : ["$"+collection.schema.elements[e].elementName, collection.schema.elements[e].yearPositionFrom-0, collection.schema.elements[e].yearPositionTo - collection.schema.elements[e].yearPositionFrom]};
                                        fields[collection.schema.elements[e].elementName+'year'] = "$"+collection.schema.elements[e].elementName+'year';
                                    } else {
                                        project[collection.schema.elements[e].elementName+'year'] = {$year: "$"+collection.schema.elements[e].elementName};
                                        fields[collection.schema.elements[e].elementName+'year'] = "$"+collection.schema.elements[e].elementName+'year';
                                    }
                                }
                                break;
                            case 'month':
                                    if (collection.schema.elements[e].extractFromString == true)
                                    {
                                        project[collection.schema.elements[e].elementName+'month'] = {"$substr" : ["$"+collection.schema.elements[e].elementName, collection.schema.elements[e].monthPositionFrom-0, collection.schema.elements[e].monthPositionTo - collection.schema.elements[e].monthPositionFrom]};
                                        fields[collection.schema.elements[e].elementName+'month'] = "$"+collection.schema.elements[e].elementName+'month';
                                    } else {
                                        project[collection.schema.elements[e].elementName+'month'] = {$month: "$"+collection.schema.elements[e].elementName};
                                        fields[collection.schema.elements[e].elementName+'month'] = "$"+collection.schema.elements[e].elementName+'month';
                                    }
                                break;
                            case 'day':
                                    if (collection.schema.elements[e].extractFromString == true)
                                    {
                                        project[collection.schema.elements[e].elementName+'day'] = {"$substr" : ["$"+collection.schema.elements[e].elementName, collection.schema.elements[e].dayPositionFrom-0, collection.schema.elements[e].dayPositionTo - collection.schema.elements[e].dayPositionFrom]};
                                        fields[collection.schema.elements[e].elementName+'day'] = "$"+collection.schema.elements[e].elementName+'day';
                                    } else {
                                        project[collection.schema.elements[e].elementName+'day'] = {$dayOfMonth: "$"+collection.schema.elements[e].elementName};
                                        fields[collection.schema.elements[e].elementName+'day'] = "$"+collection.schema.elements[e].elementName+'day';
                                    }

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

            }

        }

        //Include necessary fields for joins
        if (collections.length > 1)
        {
            for (var i in collection.joins) {
                if (collection.joins[i].sourceCollectionID == collection.collectionID)
                {
                    fields[collection.joins[i].sourceElementName] = "$"+collection.joins[i].sourceElementName;
                    project[collection.joins[i].sourceElementName] = "$"+collection.joins[i].sourceElementName;
                }
                if (collection.joins[i].targetCollectionID == collection.collectionID)
                {
                    fields[collection.joins[i].targetElementName] = "$"+collection.joins[i].targetElementName;
                    project[collection.joins[i].targetElementName] = "$"+collection.joins[i].targetElementName;
                }
            }
        }



        group['_id'] = fields;

        var aggregation = [{ $match: match }];

        if (!isEmpty(project)) aggregation.push({ $project: project });

        aggregation.push({ $group: group });

        if (!isEmpty(sort)) aggregation.push({ $sort: sort });



        //If there are joins, then we can´t set up limits...
        if (!thereAreJoins && (dataSource.params[0].packetSize > 0))
        {
            if (params.page) {
                aggregation.push({ $skip: (params.page-1)*dataSource.params[0].packetSize });
                aggregation.push({ $limit: dataSource.params[0].packetSize });
            }
            /*else {
                aggregation.push({ $limit: 10 });
            }*/
        }


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

                                if ((field == collection.schema.elements[e].elementName ||
                                      field == collection.schema.elements[e].elementName+'sum' ||
                                        field == collection.schema.elements[e].elementName+'avg' ||
                                            field == collection.schema.elements[e].elementName+'min' ||
                                                field == collection.schema.elements[e].elementName+'max' ||
                                                    field == collection.schema.elements[e].elementName+'count'
                                    )  && collection.schema.elements[e].format) {

                                    if (collection.schema.elements[e].elementType == 'date') {
                                        item[field+'_original'] = item[field];

                                        var date = new Date(item[field]);
                                        var moment = require('moment');
                                        item[field] = moment(date).format(collection.schema.elements[e].format);
                                    }

                                    if (collection.schema.elements[e].elementType == 'number') {
                                        item[field+'_original'] = item[field];
                                        var numeral = require('numeral');
                                        item[field] = numeral(item[field]).format(collection.schema.elements[e].format);
                                    }

                                }
                            }
                        }




                        var finalItem = {};
                        for (var field in item)
                        {

                            //columns for results
                            for (var e in collection.columns) {
                                if (field == collection.columns[e].elementName ||
                                      field == collection.columns[e].elementName+'sum' ||
                                        field == collection.columns[e].elementName+'avg' ||
                                            field == collection.columns[e].elementName+'min' ||
                                                field == collection.columns[e].elementName+'max' ||
                                                    field == collection.columns[e].elementName+'count')
                                                        {
                                                           if (collection.columns[e].aggregation)
                                                                    var elementID = 'wst'+collection.columns[e].elementID.toLowerCase()+collection.columns[e].aggregation;
                                                                else
                                                                    var elementID = 'wst'+collection.columns[e].elementID.toLowerCase();

                                                        var elementName = elementID.replace(/[^a-zA-Z ]/g,'');


                                                            finalItem[elementName] = item[field];
//IDENTIFY OBJECT ELEMENTS TO GENERATE DUPLICATE RECORDS FOR EVERY RESULT  i.e employees rankings.total
//if( Object.prototype.toString.call( item[field] ) === '[object Array]' ) {
  //  console.log('element name',elementName,field,item[field]);
//}

                                                        }

                                }
                            //columns for joins
                            if (collections.length > 1)
                                {
                                    for (var i in collection.joins)
                                    {
                                        if (collection.joins[i].sourceCollectionID == collection.collectionID)
                                        {
                                            if (field == collection.joins[i].sourceElementName)
                                                {
                                                var elementName = ('wst'+collection.joins[i].sourceElementID.toLowerCase()).replace(/[^a-zA-Z ]/g,'');
                                                finalItem[elementName] = item[field];
                                                }
                                        }
                                        if (collection.joins[i].targetCollectionID == collection.collectionID)
                                        {
                                            if (field == collection.joins[i].targetElementName)
                                                {
                                                var elementName = ('wst'+collection.joins[i].targetElementID.toLowerCase()).replace(/[^a-zA-Z ]/g,'');
                                                finalItem[elementName] = item[field];
                                                }
                                        }
                                    }
                                }
                        }

                        result.push(finalItem);
                    }

                    collection.result = result;
                    db.close();

                    processCollections(req,query,collections, dataSource, params,thereAreJoins, done, index+1);
                });

    });

}



