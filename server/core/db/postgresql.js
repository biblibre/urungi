

exports.testConnection = function(data, setresult) {


    var pg = require('pg');
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

      console.log('Connected to ',conString, 'getting table names');
      client.query("SELECT table_schema || '.' || table_name as name  from information_schema.tables where table_schema not in ('pg_catalog','information_schema')", function(err, result) {
         done();
         console.log(result.rows);
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

exports.processCollections = function(query,collections, dataSource, params,thereAreJoins, done) {
    processCollections(query,collections, dataSource, params,thereAreJoins, done);
};

exports.getSchemas = function(data, setresult) {
    var pg = require('pg');
    var conString = 'postgres://'+data.userName+':'+data.password+'@'+data.host+'/'+data.database;

    pg.connect(conString, function(err, client, done) {
      if(err) {
            console.log('Postgresql default connection error: ',conString, err);
            setresult({result: 0, msg: 'Connection Error: '+ err});
            return console.error('Connection Error: ', err);
      }

      var collections = data.entities;

      //get schemas
      var schemas = [];
      var tables = [];
      var schemasTables = [];

      for (var i in collections) {
           var table_name = collections[i].name;
           console.log('table name:',table_name)
           var res = table_name.split('.');

           var schema = res[0];
           var table = res[1];

           if (schemas.indexOf(schema) == -1)
                schemas.push(schema);
           if (tables.indexOf(table) == -1)
                tables.push(table);

           if (schemasTables.indexOf(schema+'.'+table) == -1)
           {
                var stable = {name: schema+'.'+table, schema:schema, table:table}
                schemasTables.push(stable);
           }

      }

        var newSchemas = schemas.length === 0 ? "" : "'" + schemas.join("','") + "'";
        var newTables = tables.length === 0 ? "" : "'" + tables.join("','") + "'";

        console.log(newSchemas,newTables);

      console.log('Connected to ',conString, 'getting table names');
      client.query("SELECT table_schema, table_name, column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema in ("+newSchemas +") AND table_name   in ("+ newTables+")", function(err, result) {
         done();
         console.log(result.rows);
         var schemas = [];
         for (var s = 0; s < schemasTables.length; s++)
         {
            getCollectionSchema(schemasTables[s],result.rows, function(resultCollection){
                    schemas.push(resultCollection);
            });
         }

         setresult({result: 1, items: schemas});
         client.end();
      });
    });
};


function getCollectionSchema(collection,queryResults, done) {

    var uuid = require('node-uuid');
    var collectionName = collection.name;
    var collectionID = 'WST'+uuid.v4();


    collectionID =  collectionID.replace(new RegExp('-', 'g'), '');
    var theCollection = {collectionID: collectionID ,collectionName: collectionName,visible:true,collectionLabel:collectionName};
    theCollection.elements = [];

    console.log('The collection Name', collectionName, collection.schema, collection.table);


    for (var d = 0; d < queryResults.length; d++) {
        var dbstruc = {};
        var elements = [];

        if (queryResults[d].table_schema == collection.schema && queryResults[d].table_name == collection.table)
            {
                    var name = queryResults[d].column_name;
                    var type = 'string';
                    /*string, number, boolean, date,
                    {name:"string",value:"string"},
        {name:"number",value:"number"},
        {name:"boolean",value:"boolean"},
        {name:"date",value:"date"},*/

                    if (queryResults[d].data_type == 'smallint' ||
                        queryResults[d].data_type == 'integer' ||
                        queryResults[d].data_type == 'bigint' ||
                        queryResults[d].data_type == 'decimal' ||
                        queryResults[d].data_type == 'numeric' ||
                        queryResults[d].data_type == 'real' ||
                        queryResults[d].data_type == 'double precision' ||
                        queryResults[d].data_type == 'serial' ||
                        queryResults[d].data_type == 'bigserial' ||
                        queryResults[d].data_type == 'money')
                            type = 'number';

                    if (queryResults[d].data_type == 'timestamp without time zone' ||
                        queryResults[d].data_type == 'timestamp with time zone' ||
                        queryResults[d].data_type == 'date' ||
                        queryResults[d].data_type == 'time without time zone' ||
                        queryResults[d].data_type == 'time with time zone' ||
                        queryResults[d].data_type == 'abstime' ||
                        queryResults[d].data_type == 'interval' )
                            type = 'date';

                    if (queryResults[d].data_type == 'boolean')
                            type = 'boolean';



                    var elementID = uuid.v4();
                    var isVisible = true;
                    theCollection.elements.push({elementID:elementID,elementName:name,elementType:type,visible:isVisible,elementLabel:name})


            }

    }

    done(theCollection);


/*
    var collection = db.collection(collectionName);
    collection.find().limit(100).toArray(function(err, results) {


        for (var i = 0; i < results.length; i++) {
            //getKP(results[i],dbstruc);
            getElementList(results[i],elements,'');
        }

        var names = [];

        schemas.push(theCollection);
        getCollectionSchema(db,collections,index+1,schemas, done);
    }); */
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

function processCollections(query,collections, dataSource, params, thereAreJoins, setresult,  index) {
    //console.log(JSON.stringify(query));

    // https://hiddentao.github.io/squel/


    var from = [];
    var fields = [];
    var groupBy = [];
    var joins = [];
    var processedCollections = [];
    var leadTable = {};
    var leadTableJoinsCount = 0;

    if (collections.length == 1)
    {
        leadTable = collections[0];
    }

    for (var c in collections) {
        var table = collections[c];
        table.joinsCount = 0;

        for (var j in table.joins) {
            var join = table.joins[j];
            if (join.sourceCollectionID == table.collectionID)
               {
               table.joinsCount = table.joinsCount + 1;
               }

            if (join.targetCollectionID == table.collectionID)
               {
               table.joinsCount = table.joinsCount + 1;
               }
        }

        if (table.joinsCount > leadTableJoinsCount)
        {
            leadTable = table;
            leadTableJoinsCount = table.joinsCount;
        }

    }

    //console.log('lead table is: ',JSON.stringify(leadTable));


    for (var c in collections) {
        var table = collections[c];
        var strJoin = '';



        for (var j in table.joins) {

            var join = table.joins[j];

            if (join.sourceCollectionID == table.collectionID)
               {

               if (join.joinType == 'default')
                         strJoin = ' INNER JOIN ';

               processedCollections.push(join.targetCollectionID);

               strJoin = strJoin + join.targetCollectionName +' '+ join.targetCollectionID + ' ON (';

               strJoin = strJoin + join.sourceCollectionID + '.' + join.sourceElementName + ' = ' + join.targetCollectionID + '.' + join.targetElementName;
               strJoin = strJoin + ')';
               }

    }

        if (processedCollections.indexOf(table.collectionID) == -1)
            from.push(table.schema.collectionName +' '+table.collectionID + strJoin);

        processedCollections.push(table.collectionID);

        for (var e in table.columns)
            {
            var field = table.columns[e];
            //TODO: Count test

            if (field.aggregation) {
                                    found = true;
                                    switch (field.aggregation) {
                                        case 'sum': fields.push('SUM('+table.collectionID+'.'+field.elementName+')'+ ' as '+table.collectionID.toLowerCase()+'_'+field.elementName+'sum');
                                            break;
                                        case 'avg': fields.push('AVG('+table.collectionID+'.'+field.elementName+')'+ ' as '+table.collectionID.toLowerCase()+'_'+field.elementName+'avg');
                                            break;
                                        case 'min': fields.push('MIN('+table.collectionID+'.'+field.elementName+')'+ ' as '+table.collectionID.toLowerCase()+'_'+field.elementName+'min');
                                            break;
                                        case 'max': fields.push('MAX('+table.collectionID+'.'+field.elementName+')'+ ' as '+table.collectionID.toLowerCase()+'_'+field.elementName+'max');
                                            break;
                                        case 'count': fields.push('COUNT('+table.collectionID+'.'+field.elementName+')'+ ' as '+table.collectionID.toLowerCase()+'_'+field.elementName+'count');
                                    }
                                } else {
                                    fields.push(table.collectionID+'.'+field.elementName + ' as '+table.collectionID.toLowerCase()+'_'+field.elementName);
                                    groupBy.push(table.collectionID+'.'+field.elementName);
                                }
            }





    }

    //get target collection for joins




    var SQLstring = 'SELECT ';

    for (var f in fields)
    {
        if (f == fields.length -1)
            SQLstring = SQLstring + fields[f];
        else
            SQLstring = SQLstring + fields[f]+', ';
    }
/*
    SQLstring = SQLstring + ' FROM ';
    for (var f in from)
    {
        if (f == from.length -1)
            SQLstring = SQLstring + from[f];
        else
            SQLstring = SQLstring + from[f]+', ';
    }*/

    SQLstring = SQLstring + ' FROM '+ leadTable.schema.collectionName + ' '+ leadTable.collectionID + getJoins(leadTable.collectionID,collections,[]);

    //FILTERS
    /*
    for (var c in collections) {
            var table = collections[c];
            getCollectionFilters(table);
            //console.log(JSON.stringify(table));
            //console.log(getCollectionFilters(table));
    }
    */
/*
    for (var coll in collections)
    {

       var table = collections[coll];
       //console.log('table filters', table);
        query.groupFilters = [];

        for (var fil in table.filters)
        {
            query.groupFilters.push(table.filters[fil]);
            console.log('added filter', table.filters[fil]);
        }

    }*/

    var havings = [];

    getFilters(query, function(filtersResult,havingsResult){

        if (filtersResult.length > 0)
            SQLstring += ' WHERE ';
        for (var fr in filtersResult)
            SQLstring += filtersResult[fr];
        havings = havingsResult;



        if (groupBy.length > 0)
            SQLstring = SQLstring + ' GROUP BY ';

        for (var f in groupBy)
        {
            if (f == groupBy.length -1)
                SQLstring = SQLstring + groupBy[f];
            else
                SQLstring = SQLstring + groupBy[f]+', ';
        }

        //TODO: Order By's


        if (havings.length > 0)
                SQLstring += ' HAVING ';

        for (var h in havings)
                SQLstring += havings[h];


        console.log(SQLstring);


        var pg = require('pg');
        var conString = 'postgres://'+dataSource.params[0].connection.userName+':'+dataSource.params[0].connection.password+'@'+dataSource.params[0].connection.host+'/'+dataSource.params[0].connection.database;

        pg.connect(conString, function(err, client, done) {
          if(err) {
                console.log('Postgresql default connection error: ',conString, err);
                setresult({result: 0, msg: 'Connection Error: '+ err});
                return console.error('Connection Error: ', err);
          }

          console.log('Connected to ',conString);
          client.query(SQLstring, function(err, result) {
             done();
             //console.log(result.rows);
             //setresult({result: 1, items: result.rows});
             if (result)
                setresult(result.rows);
                else
                setresult([]);
             client.end();
          });
        });


    });

    //SQLstring = SQLstring + getFilters(query,false);

    /*
    for (var f in joins)
    {
        if (f == 0)
            SQLstring = SQLstring + ' WHERE ' + joins[f];
        else
            SQLstring = SQLstring + ' AND ' + joins[f];
    }*/




    //SQLstring = SQLstring + getFilters(query,true); //filters for HAVING


}


function getFiltersV2(collections,done)
{
   //console.log(JSON.stringify(query.groupFilters));
   var theFilter = '';
   var filters = [];
   var havings = [];
   var previousRelational = '';


   for (var coll in collections) {
   var table = collections[coll];

   for (var g in table.filters) {

       console.log('table filters',table.filters);


            if (table.filters[g].condition)
                    {
                        theFilter = theFilter + ' '+table.filters[g].conditionType+' ';
                        previousRelational = ' '+table.filters[g].conditionType+' ';
                    }

            if (!table.filters[g].condition)
            {
               var filterSQL = getFilterSQL(table.filters[g]);


               if (!table.filters[g].aggregation)
                    {
                        if (filters.length > 0)
                            filterSQL = previousRelational + filterSQL;

                        filters.push(filterSQL);
                    } else {
                        if (havings.length > 0)
                            filterSQL = previousRelational + filterSQL;

                        havings.push(filterSQL);
                    }

            }

            theFilter = theFilter + getFilterSQL(table.filters[g]);


   }
   }
   //if (theFilter != '' && isHaving == false)
     //       theFilter = ' WHERE '+theFilter;

   //if (theFilter != '' && isHaving == true)
     //       theFilter = ' HAVING '+theFilter;

    done(filters,havings);

   //return theFilter;
}

function getFilters(query,done)
{
   console.log(JSON.stringify(query.groupFilters));
   var theFilter = '';
   var filters = [];
   var havings = [];
   var previousRelational = '';

   for (var g in query.groupFilters) {

        for (var f in query.groupFilters[g].filters)
        {
            if (query.groupFilters[g].filters[f].condition)
                    {
                        theFilter = theFilter + ' '+query.groupFilters[g].filters[f].conditionType+' ';
                        previousRelational = ' '+query.groupFilters[g].filters[f].conditionType+' ';
                    }

            if (!query.groupFilters[g].filters[f].condition)
            {
               var filterSQL = getFilterSQL(query.groupFilters[g].filters[f]);


               if (!query.groupFilters[g].filters[f].aggregation)
                    {
                        if (filters.length > 0)
                            filterSQL = previousRelational + filterSQL;

                        filters.push(filterSQL);
                    } else {
                        if (havings.length > 0)
                            filterSQL = previousRelational + filterSQL;

                        havings.push(filterSQL);
                    }

            }

            theFilter = theFilter + getFilterSQL(query.groupFilters[g].filters[f]);
        }

   }
   //if (theFilter != '' && isHaving == false)
     //       theFilter = ' WHERE '+theFilter;

   //if (theFilter != '' && isHaving == true)
     //       theFilter = ' HAVING '+theFilter;

    done(filters,havings);

   //return theFilter;
}


function getFilterSQL(filter,isHaving)
{
     var result = '';


        if ((filter.filterText1 || filter.filterType == 'notNull' || filter.filterType == 'null') ) {

                    var thisFilter = {}, filterValue = filter.filterText1;
                    if (!filter.aggregation)
                        var filterElementName = filter.collectionID+'.'+filter.elementName;
                        else
                        var filterElementName = filter.aggregation+'('+filter.collectionID+'.'+filter.elementName+')';


                    if (filter.elementType == 'number') {
                        filterValue = Number(filterValue);
                    }
                    if (filter.elementType == 'date') {

                        if (filter.filterType == "in" || filter.filterType == "notIn")
                        {
                           thisFilter = dateFilter(filterValue,filter);
                        } else
                        thisFilter[filterElementName] = dateFilter(filterValue,filter);
                    }

                    if (filter.filterType == "equal" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                            result = filterElementName +' = '+filterValue;
                            else
                            result = (filterElementName +' = '+'\''+filterValue+'\'');
                    }
                    if (filter.filterType == "diferentThan" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                                result = (filterElementName +' <> '+filterValue);
                                else
                                result = (filterElementName +' <> '+'\''+filterValue+'\'');
                    }
                    if (filter.filterType == "biggerThan" && filter.elementType != 'date' ) {
                            if (filter.elementType == 'number')
                                result = (filterElementName +' > '+filterValue);
                                else
                                result = (filterElementName +' > '+'\''+filterValue+'\'');
                    }
                    if (filter.filterType == "notGreaterThan" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                                result = (filterElementName +' <= '+filterValue);
                                else
                                result = (filterElementName +' <= '+'\''+filterValue+'\'');
                    }
                    if (filter.filterType == "biggerOrEqualThan" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                                result = (filterElementName +' >= '+filterValue);
                                else
                                result = (filterElementName +' >= '+'\''+filterValue+'\'');
                    }
                    if (filter.filterType == "lessThan" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                                result = (filterElementName +' < '+filterValue);
                                else
                                result = (filterElementName +' < '+'\''+filterValue+'\'');
                    }
                    if (filter.filterType == "lessOrEqualThan" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                                result = (filterElementName +' <= '+filterValue);
                                else
                                result = (filterElementName +' <= '+'\''+filterValue+'\'');
                    }
                    if (filter.filterType == "between" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                                result = ('BETWEEN '+filterValue+' AND '+filter.filterText2);
                                else
                                result = ('BETWEEN '+'\''+filterValue+'\''+' AND '+'\''+filter.filterText2+'\'');
                    }
                    if (filter.filterType == "notBetween" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                                result = ('NOT BETWEEN '+filterValue+' AND '+filter.filterText2);
                                else
                                result = ('NOT BETWEEN '+'\''+filterValue+'\''+' AND '+'\''+filter.filterText2+'\'');
                    }
                    if (filter.filterType == "contains") {
                        result = (filterElementName +' LIKE '+'\'%'+filterValue+'%\'');
                    }
                    if (filter.filterType == "notContains") {
                        result = (filterElementName +' NOT LIKE '+'\'%'+filterValue+'%\'');
                    }
                    if (filter.filterType == "startWith") {
                        result = (filterElementName +' LIKE '+'\''+filterValue+'%\'');
                    }
                    if (filter.filterType == "notStartWith") {
                        result = (filterElementName +' NOT LIKE '+'\''+filterValue+'%\'');
                    }
                    if (filter.filterType == "endsWith") {
                        result = (filterElementName +' LIKE '+'\'%'+filterValue+'\'');
                    }
                    if (filter.filterType == "notEndsWith") {
                        result = (filterElementName +' NOT LIKE '+'\'%'+filterValue+'\'');
                    }
                    if (filter.filterType == "like") {
                        result = (filterElementName +' LIKE '+'\'%'+filterValue+'%\'');
                    }
                    if (filter.filterType == "notLike") {
                        result = (filterElementName +' NOT LIKE '+'\'%'+filterValue+'%\'');
                    }
                    if (filter.filterType == "null") {
                        result = (filterElementName +' IS NULL ');
                    }
                    if (filter.filterType == "notNull") {
                        result = (filterElementName +' IS NOT NULL ');
                    }
                    if (filter.filterType == "in"  && filter.elementType != 'date') {
                        result = (filterElementName +' IN '+'('+String(filterValue).split(';')+')');
                    }
                    if (filter.filterType == "notIn" && filter.elementType != 'date') {
                        result = (filterElementName +' NOT IN '+'('+String(filterValue).split(';')+')');
                    }
        }

    return result;
}



function getJoins(collectionID,collections,processedCollections)
{
console.log('entering');
var fromSQL = '';

    for (var c in collections) {
        if (collections[c].collectionID == collectionID && (processedCollections.indexOf(collectionID) == -1))
        {
        var table = collections[c];
        processedCollections.push(collectionID);
        console.log('pushed collection',collectionID);



            for (var j in table.joins) {
                    var join = table.joins[j];


                    if (join.sourceCollectionID == table.collectionID && (processedCollections.indexOf(join.targetCollectionID) == -1))
                       {
                           if (join.joinType == 'default')
                                fromSQL = fromSQL + ' INNER JOIN ';



                           fromSQL = fromSQL + join.targetCollectionName + ' '+ join.targetCollectionID;

                           fromSQL = fromSQL + ' ON ('+join.sourceCollectionID+'.'+join.sourceElementName+' = '+join.targetCollectionID+'.'+join.targetElementName+')';

                           fromSQL = fromSQL + getJoins(join.targetCollectionID,collections,processedCollections);

                       }

                    if (join.targetCollectionID == table.collectionID && (processedCollections.indexOf(join.sourceCollectionID) == -1))
                       {
                           if (join.joinType == 'default')
                                fromSQL = fromSQL + ' INNER JOIN ';



                           fromSQL = fromSQL + join.sourceCollectionName + ' '+ join.sourceCollectionID;

                           fromSQL = fromSQL + ' ON ('+join.targetCollectionID+'.'+join.targetElementName+' = '+join.sourceCollectionID+'.'+join.sourceElementName+')';

                           fromSQL = fromSQL + getJoins(join.targetCollectionID,collections,processedCollections);
                       }

                }




        }

    }

return fromSQL;

}

function getOrderBys(collection)
{
    var sort = {};

    if (collection.order) {
        console.log('there is order');
        for (var i in collection.order) {
            console.log('there is order for each');
            for (var e in collection.schema.elements) {
                if (collection.order[i] != undefined)
                {
                    if (collection.order[i].elementID == collection.schema.elements[e].elementID) {
                        console.log('there is order founded');
                        var found = false;

                        for (var c in collection.columns) {
                            if (collection.columns[c].elementID == collection.schema.elements[e].elementID) {


                                console.log('there is order found',collection.schema.elements[e].elementName);

                                console.log('there is order found 2',JSON.stringify(collection.order));

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

    console.log('he salido de order',JSON.stringify(sort));
    }


function getCollectionFilters(collection) {
    var theFilters = [], condition = false;
    filters = collection.filters;

    console.log('getCollectionFilters',filters);

    for (var i in filters) {
        var filter = filters[i];

        console.log('un filtro',JSON.stringify(filter));

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
                    if (collection.schema.elements[e].elementType == 'date') {

                        if (filter.filterType == "in" || filter.filterType == "notIn")
                        {
                           thisFilter = dateFilter(filterValue,filter);
                        } else
                        thisFilter[filterElementName] = dateFilter(filterValue,filter);
                    }

                    if (filter.filterType == "equal" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                            console.log(filterElementName +' = '+filterValue);
                            else
                            console.log(filterElementName +' = '+'\''+filterValue+'\'');
                    }
                    if (filter.filterType == "diferentThan" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                                console.log(filterElementName +' <> '+filterValue);
                                else
                                console.log(filterElementName +' <> '+'\''+filterValue+'\'');
                    }
                    if (filter.filterType == "biggerThan" && filter.elementType != 'date' ) {
                            if (filter.elementType == 'number')
                                console.log(filterElementName +' > '+filterValue);
                                else
                                console.log(filterElementName +' > '+'\''+filterValue+'\'');
                    }
                    if (filter.filterType == "notGreaterThan" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                                console.log(filterElementName +' <= '+filterValue);
                                else
                                console.log(filterElementName +' <= '+'\''+filterValue+'\'');
                    }
                    if (filter.filterType == "biggerOrEqualThan" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                                console.log(filterElementName +' >= '+filterValue);
                                else
                                console.log(filterElementName +' >= '+'\''+filterValue+'\'');
                    }
                    if (filter.filterType == "lessThan" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                                console.log(filterElementName +' < '+filterValue);
                                else
                                console.log(filterElementName +' < '+'\''+filterValue+'\'');
                    }
                    if (filter.filterType == "lessOrEqualThan" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                                console.log(filterElementName +' <= '+filterValue);
                                else
                                console.log(filterElementName +' <= '+'\''+filterValue+'\'');
                    }
                    if (filter.filterType == "between" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                                console.log('BETWEEN '+filterValue+' AND '+filter.filterText2);
                                else
                                console.log('BETWEEN '+'\''+filterValue+'\''+' AND '+'\''+filter.filterText2+'\'');
                    }
                    if (filter.filterType == "notBetween" && filter.elementType != 'date') {
                        if (filter.elementType == 'number')
                                console.log('NOT BETWEEN '+filterValue+' AND '+filter.filterText2);
                                else
                                console.log('NOT BETWEEN '+'\''+filterValue+'\''+' AND '+'\''+filter.filterText2+'\'');
                    }
                    if (filter.filterType == "contains") {
                        console.log(filterElementName +' LIKE '+'\'%'+filterValue+'%\'');
                    }
                    if (filter.filterType == "notContains") {
                        console.log(filterElementName +' NOT LIKE '+'\'%'+filterValue+'%\'');
                    }
                    if (filter.filterType == "startWith") {
                        console.log(filterElementName +' LIKE '+'\''+filterValue+'%\'');
                    }
                    if (filter.filterType == "notStartWith") {
                        console.log(filterElementName +' NOT LIKE '+'\''+filterValue+'%\'');
                    }
                    if (filter.filterType == "endsWith") {
                        console.log(filterElementName +' LIKE '+'\'%'+filterValue+'\'');
                    }
                    if (filter.filterType == "notEndsWith") {
                        console.log(filterElementName +' NOT LIKE '+'\'%'+filterValue+'\'');
                    }
                    if (filter.filterType == "like") {
                        console.log(filterElementName +' LIKE '+'\'%'+filterValue+'%\'');
                    }
                    if (filter.filterType == "notLike") {
                        console.log(filterElementName +' NOT LIKE '+'\'%'+filterValue+'%\'');
                    }
                    if (filter.filterType == "null") {
                        console.log(filterElementName +' IS NULL ');
                    }
                    if (filter.filterType == "notNull") {
                        console.log(filterElementName +' IS NOT NULL ');
                    }
                    if (filter.filterType == "in"  && filter.elementType != 'date') {
                        console.log(filterElementName +' IN '+'('+String(filterValue).split(';')+')');
                    }
                    if (filter.filterType == "notIn" && filter.elementType != 'date') {
                        console.log(filterElementName +' NOT IN '+'('+String(filterValue).split(';')+')');
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


/*
function processCollections(collections, dataSource, params, thereAreJoins, done,  index) {
    var index = (index) ? index : 0;
    var collection = (collections[index]) ? collections[index] : false;
    var result = (result) ? result : [];

    if (!collection) {
        done();
        return;

    }



    //console.log('entering mongoDB collections these are the joins ',JSON.stringify(collection.joins));
    var fields = {};

    var filters = getCollectionFilters(collection, collection.filters);

    //console.log('the Filters');
    //debug(filters);

    //console.log(JSON.stringify(collection));

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
        console.log('there is order');
        for (var i in collection.order) {
            console.log('there is order for each');
            for (var e in collection.schema.elements) {
                if (collection.order[i] != undefined)
                {
                    if (collection.order[i].elementID == collection.schema.elements[e].elementID) {
                        console.log('there is order founded');
                        var found = false;

                        for (var c in collection.columns) {
                            if (collection.columns[c].elementID == collection.schema.elements[e].elementID) {


                                console.log('there is order found',collection.schema.elements[e].elementName);

                                console.log('there is order found 2',JSON.stringify(collection.order));

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

    console.log('he salido de order',JSON.stringify(sort));

    //console.log('the fields to get');
    //debug(fields);

    var MongoClient = require('mongodb').MongoClient , assert = require('assert');

    var dbURI =  'mongodb://'+dataSource.params[0].connection.host+':'+dataSource.params[0].connection.port+'/'+dataSource.params[0].connection.database;

    MongoClient.connect(dbURI, function(err, db) {
        if(err) { return console.dir(err); }

        var col = db.collection(collection.schema.collectionName);
        var match = filters, project = {}, group = {}, fields = {};

        for (var i in collection.columns) {
            var found = false;

            //if (collection.columns[i].count) {
            if (collection.columns[i].elementName == 'WSTcount'+collection.schema.collectionName) {
                console.log('lleva conteo');
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
            //ADD the necessary fields for joins


        }


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

        if (!thereAreJoins)
        {
            if (params.page) {
                aggregation.push({ $skip: (params.page-1)*100 });
                aggregation.push({ $limit: 100 });
            }
            else {
                aggregation.push({ $limit: 10 });
            }
        }

        console.log('aggregation');
        debug(aggregation);

        col.aggregate(aggregation, function(err, docs) {
            //debug(docs);
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
                                        field == collection.schema.elements[e].elementName+'max'
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


                //cambio de nombre añadiendo el nombre de la colección


                var finalItem = {};
                for (var field in item) {
                    finalItem[collection.schema.collectionID+'_'+field] = item[field];
                }


                //result.push(item);
                result.push(finalItem);
            }
            //debug(result);
            console.log('this is the collection', collection.schema.collectionName,result.length);
            collection.result = result;
            db.close();

            processCollections(collections, dataSource, params,thereAreJoins, done, index+1);
        });
    });
}*/

