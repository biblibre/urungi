const layerUtils = require('../../shared/layerUtils.js');

exports.execute = async function (query) {
    const warnings = [];

    const Layer = connection.model('Layers');
    const lyrList = await Layer.find({ _id: query.layerID });
    if (lyrList.length === 0) {
        throw new Error('Layer not found');
    }
    const queryLayer = lyrList[0];

    const datasourceID = queryLayer.params.schema[0].datasourceID;

    const DataSource = connection.model('DataSources');
    const dtsList = await DataSource.find({ _id: datasourceID });
    if (dtsList.length === 0) {
        throw new Error('Data source not found');
    }
    const dts = dtsList[0];

    const processedQuery = await processQuery(query, queryLayer, warnings);
    buildJoinTree(processedQuery, queryLayer, warnings);

    var Db;
    var db;

    switch (dts.type) {
    case 'MySQL': case 'POSTGRE': case 'ORACLE': case 'MSSQL':

        Db = require('./connection').Db;

        db = new Db(dts, warnings);
        const result = await db.runQuery(processedQuery);

        if (result.result === 1) {
            processData(processedQuery, result.data);
        } else {
            console.log(result.msg);
        }

        db.close();

        result.warnings = warnings;
        return result;

    case 'JDBC-ORACLE': case 'BIGQUERY':
        /*
        * Neither JDBC nor bigquery are supported by knex.js
        * This is an attempt to keep the support of these libraries with pre-existing code
        *
        * These libraries have not been tested as the changes to query resolution were made,
        * and there is no guarantee of how well they work
        *
        * It is also unclear what the purpose of jdbc-oracle is when oracle is supported
        */

        if (dts.type === 'JDBC-ORACLE') {
            Db = require('./legacy/jdbc-oracle').Db;
        }
        if (dts.type === 'BIGQUERY') {
            Db = require('./legacy/bigquery').Db;
        }

        const legacySQLBuilder = require('./legacy/sql');

        const sqlText = legacySQLBuilder.generateQueryText(processedQuery);

        db = new Db(dts.connection);

        return new Promise((resolve, reject) => {
            db.connect(dts.connection, function (err, connection) {
                if (err) {
                    resolve({ result: 0, msg: String(err) });
                    return;
                }

                const start = Date.now();

                db.query(sqlText, function (err, result) {
                    if (err) {
                        resolve({ result: 0, msg: String(err) });
                        return;
                    }

                    const time = Date.now() - start;

                    const data = result.rows;

                    processData(processedQuery, data);

                    resolve({ result: 1, data: data, sql: sqlText, time: time });
                });
            });
        });

    default:
        throw new Error('Invalid datasource type : ' + dts.type);
    }
};

function processQuery (query, queryLayer, warnings) {
    /*
    * Connects the query with the layer and creates a processedQuery object which can be used to build the sql query text
    *
    * This function ensures part of the database security
    *   - the query object comes from the client, and cannot be trusted
    *   - the queryLayer object was created by an administrator, and should be trusted
    *   - the processQuery object is built by using the layer as an interface. the report does not have direct access to the database
    *
    * This function does not need to protect against sql injections : Knex.js will do that
    *   - Strings coming from the user are still validated as an extra precaution, and to prevent invalid input
    *
    */

    const processedQuery = {};

    processedQuery.columns = [];
    processedQuery.order = [];
    processedQuery.filters = [];

    var elementSet = {
        content: [],
        add: function (element) {
            if (!this.content.find(el => el.elementID === element.elementID)) {
                this.content.push(element);
            }
        }
    };
    var groupKeys = new Set();

    processedQuery.joinTree = {};

    // For now, a good portion of the code is written to enable the use of
    // multiple datasources in a report
    // This is why the layer does not have a single datasourceID field
    processedQuery.datasourceID = queryLayer.params.schema[0].datasourceID;

    function addElement (element, elementSet) {
        if (!element.isCustom) {
            elementSet.add(element);
        } else {
            for (const argElement of layerUtils.getElementsUsedInCustomExpression(element.viewExpression, queryLayer)) {
                if (!argElement.isCustom) {
                    elementSet.add(argElement);
                }
            }
        }
    }

    for (const col of query.columns) {
        const element = findElement(queryLayer.objects, col.elementID);
        if (!element) {
            warnings.push({msg: 'element ' + col.objectLabel + ' could not be found. Are you sure it has not been deleted ?'});
            continue;
        }

        addElement(element, elementSet);

        const validCol = validateColumn(col, element, warnings);
        processedQuery.columns.push(validCol);
        if (!validCol.aggregation) {
            // FIXME No need to GROUP BY if no aggregate functions is used at all
            groupKeys.add(col);
        }
    }

    for (const col of query.order) {
        const element = findElement(queryLayer.objects, col.elementID);
        if (!element) {
            warnings.push({msg: 'element ' + col.objectLabel + ' could not be found. Are you sure it has not been deleted ?'});
            continue;
        }

        addElement(element, elementSet);
        processedQuery.order.push(validateOrder(col, element, warnings));
    }

    for (const col of query.filters) {
        const element = findElement(queryLayer.objects, col.elementID);
        if (!element) {
            warnings.push({msg: 'element ' + col.objectLabel + ' could not be found. Are you sure it has not been deleted ?'});
            continue;
        }

        addElement(element, elementSet);
        const vf = validateFilter(col, element, escape, warnings);
        if (vf) {
            processedQuery.filters.push(vf);
        }
    }

    if (query.recordLimit) {
        processedQuery.recordLimit = validateLimit(query.recordLimit);
    }
    if (query.quickResultLimit) {
        processedQuery.quickResultLimit = validateLimit(query.quickResultLimit);
    }

    processedQuery.page = validatePage(query.page);

    processedQuery.elements = elementSet.content;

    processedQuery.groupKeys = Array.from(groupKeys.values());

    processedQuery.layer = queryLayer;

    return processedQuery;
}

function findElement (elementList, elementID) {
    for (const el of elementList) {
        if (el.elementID === elementID) {
            return el;
        }
        if (el.elements) {
            const found = findElement(el.elements, elementID);
            if (found) { return found; }
        }
    }
}

function buildJoinTree (query, queryLayer, warnings) {
    /*
    * Creates the join tree object, which will be used to create the join clause in the SQL query
    *
    * The query layer contains a set of collections (stored in layer.params.schema), and a set of joins (stored in layer.params.joins)
    * The collections and joins constitue a graph, with the collections being node, and the joins being edges.
    * This functions only works if
    *
    * 1 ) all the collections used by the query are in the same connected component (otherwise they cannot be joined together)
    * 2) the join graph is acyclic
    *
    * The algorithm then constructs a tree, starting from an arbitrary collection and joining it with the others.
    */

    var collectionRef = {}; // a reference of which collections need to be added to the join

    for (const column of query.columns.concat(query.filters, query.order)) {
        if (column.isCustom) {
            for (const element of layerUtils.getElementsUsedInCustomExpression(column.viewExpression, queryLayer)) {
                collectionRef[element.collectionID] = true;
            }
        } else {
            collectionRef[column.collectionID] = true;
        }
    }

    const rootID = Object.keys(collectionRef)[0];

    if (!rootID) {
        throw new Error('No collection needed to be joined');
    }

    const result = joinCollections(collectionRef, query.layer, rootID, null, 0, warnings);

    if (!result.shouldJoin) {
        throw new Error('No collection needed to be joined');
    }

    query.joinTree = result.node;

    for (const element of query.elements) {
        addElement(query.joinTree, element);
    }
}

function joinCollections (collectionRef, layer, currentID, previousID, safetyCount, warnings) {
    if (safetyCount > 100) {
        throw new Error('Too many joins while building join tree ( > 100). Make sure the join schema has no cycle.');
    }

    var shouldJoin = false;
    if (collectionRef[currentID]) {
        shouldJoin = true;
    }

    var node = {};
    node.collection = layer.params.schema.find(c => c.collectionID === currentID);

    if (!node.collection) {
        warnings.push({msg: 'A join was found linking to a collection which does not exist', obj: node});
        return {shouldJoin: false};
    }

    node.joins = [];
    node.fetchFields = [];
    node.carryFields = [];

    for (const join of layer.params.joins) {
        var joinedID = null;
        var joinElementID;

        if (join.sourceCollectionID === currentID) {
            joinedID = join.targetCollectionID;
            joinElementID = join.targetElementID;
        }

        if (join.targetCollectionID === currentID) {
            joinedID = join.sourceCollectionID;
            joinElementID = join.sourceElementID;
        }

        if (joinedID && joinedID !== previousID) {
            var result = joinCollections(collectionRef, layer, joinedID, currentID, (safetyCount + 1), warnings);

            if (result.shouldJoin) {
                shouldJoin = true;
                result.node.parentJoin = join;
                const joinElement = findElement(layer.params.schema, joinElementID);
                if (!joinElement) {
                    warnings.push({ msg: 'Unable to join a table due to missing join field' });
                    continue;
                }
                result.node.fetchFields.push(joinElement);
                node.joins.push(result.node);
            }
        }
    }

    return {
        shouldJoin: shouldJoin,
        node: node
    };
}

function addElement (node, element) {
    for (const childNode of node.joins) {
        if (addElement(childNode, element)) {
            node.carryFields.push(element);
            return true;
        }
    }

    if (element.collectionID === node.collection.collectionID) {
        if (!node.fetchFields.find(el => el.elementID === element.elementID)) {
            node.fetchFields.push(element);
        }
        return true;
    } else {
        return false;
    }
}

function validateColumn (column, element, warnings) {
    /*
    *
    * The element object was fetched in the database server side, and can be trusted
    * The column object arrives directly from the client, and cannot be trusted
    */

    const validColumn = {
        datasourceID: element.datasourceID,
        collectionID: element.collectionID,
        elementID: element.elementID,
        elementName: element.elementName,
        elementType: element.elementType,
        layerID: element.layerID,
        isCustom: Boolean(element.isCustom),
        expression: element.expression,
        viewExpression: element.viewExpression,
    };

    if (column.aggregation) {
        validColumn.aggregation = plainText(column.aggregation, warnings);
    }
    validColumn.id = plainText(column.id, warnings);

    return validColumn;
}

function validateOrder (order, element, warnings) {
    const validOrder = validateColumn(order, element, warnings);

    validOrder.sortDesc = (order.sortType === -1);

    return validOrder;
}

function validateFilter (filter, element, escape, warnings) {
    if (element.elementType === 'date') {

    } else {
        switch (filter.filterType) {
        case 'null':
        case 'notNull':
            break;
        case 'in':
        case 'notIn':
            if (!filter.criterion.textList || filter.criterion.textList.length === 0) {
                return '';
            }
            break;
        case 'between':
        case 'notBetween':
            if (!(filter.criterion.text1 && filter.criterion.text2)) {
                return '';
            }
            break;
        default:
            if (!filter.criterion.text1) {
                return '';
            }
        }
    }

    const validFilter = validateColumn(filter, element, warnings);

    validFilter.filterType = String(filter.filterType);

    if (filter.conditionType) {
        validFilter.conditionType = plainText(filter.conditionType, warnings);
    }

    validFilter.criterion = {};

    for (const crit of ['date1', 'date2', 'datePattern', 'text1', 'text2']) {
        if (filter.criterion[crit]) {
            validFilter.criterion[crit] = String(filter.criterion[crit]);
        }
    }

    if (filter.criterion.textList) {
        var validTextList = [];
        for (const item of filter.criterion.textList) {
            validTextList.push(String(item));
        }
        validFilter.criterion.textList = validTextList;
    }

    return validFilter;
}

function plainText (text, warnings) {
    var secureText;
    try {
        secureText = String(text).replace(/[^a-zA-Z0-9]/g, '');
    } catch (err) {
        secureText = '';
    }
    if (secureText !== String(text)) {
        warnings.push({
            msg: 'A text fields has been modified to prevent sql injections',
            text: text
        });
    }
    return secureText;
}

function validateLimit (limit) {
    var lim = Math.floor(limit);
    if (lim && lim > 0) {
        return lim;
    }
}

function validatePage (page) {
    var validPage = Math.floor(page);
    if (validPage && validPage > 0) {
        return validPage;
    } else {
        return 1;
    }
}

function processData (query, data) {
    var moment = require('moment');

    for (var row of data) {
        for (var col of query.columns) {
            if (col.elementType === 'date' && col.format) {
                if (row[col.id]) {
                    row[col.id + '_original'] = row[col.id];
                    var date = new Date(row[col.id]);
                    row[col.id] = moment(date).format(col.format);
                }
            }
        }
    }
};
