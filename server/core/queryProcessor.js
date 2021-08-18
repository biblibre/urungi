const mongoose = require('mongoose');
const layerUtils = require('../../shared/layerUtils.js');
const DatabaseClient = require('../core/database-client.js');

exports.execute = async function (query) {
    const warnings = [];

    const Layer = mongoose.model('Layer');
    const queryLayer = await Layer.findById(query.layerID);
    if (!queryLayer) {
        throw new Error('Layer not found');
    }

    const datasourceID = queryLayer.datasourceID;

    const Datasource = mongoose.model('Datasource');
    const dts = await Datasource.findById(datasourceID);
    if (!dts) {
        throw new Error('Data source not found');
    }

    const processedQuery = processQuery(query, queryLayer, warnings);
    buildJoinTree(processedQuery, queryLayer, warnings);

    const validTypes = ['MySQL', 'POSTGRE', 'ORACLE', 'MSSQL'];
    if (!validTypes.includes(dts.type)) {
        throw new Error('Invalid datasource type : ' + dts.type);
    }

    const dbClient = DatabaseClient.fromDatasource(dts);
    const result = await dbClient.getQueryResults(processedQuery);

    result.warnings = warnings;

    return result;
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

    const groupKeys = new Set();

    processedQuery.joinTree = {};

    processedQuery.datasourceID = queryLayer.datasourceID;

    const queryHasAggregation = query.columns.some(c => c.aggregation);
    for (const col of query.columns) {
        const element = findElement(queryLayer.objects, col.elementID);
        if (!element) {
            warnings.push({ msg: 'element ' + col.elementLabel + ' could not be found. Are you sure it has not been deleted ?' });
            continue;
        }

        const validCol = validateColumn(col, element, warnings);
        processedQuery.columns.push(validCol);
        if (queryHasAggregation && !validCol.aggregation) {
            groupKeys.add(col);
        }
    }

    for (const col of query.order) {
        const element = findElement(queryLayer.objects, col.elementID);
        if (!element) {
            warnings.push({ msg: 'element ' + col.elementLabel + ' could not be found. Are you sure it has not been deleted ?' });
            continue;
        }

        processedQuery.order.push(validateOrder(col, element, warnings));
    }

    for (const col of query.filters) {
        const element = findElement(queryLayer.objects, col.elementID);
        if (!element) {
            warnings.push({ msg: 'element ' + col.elementLabel + ' could not be found. Are you sure it has not been deleted ?' });
            continue;
        }

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

    const collectionRef = {}; // a reference of which collections need to be added to the join

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
}

function joinCollections (collectionRef, layer, currentID, previousID, safetyCount, warnings) {
    if (safetyCount > 100) {
        throw new Error('Too many joins while building join tree ( > 100). Make sure the join schema has no cycle.');
    }

    let shouldJoin = false;
    if (collectionRef[currentID]) {
        shouldJoin = true;
    }

    const node = {};
    node.collection = layer.params.schema.find(c => c.collectionID === currentID);

    if (!node.collection) {
        warnings.push({ msg: 'A join was found linking to a collection which does not exist', obj: node });
        return { shouldJoin: false };
    }

    node.joins = [];

    for (const join of layer.params.joins) {
        let joinedID = null;
        let joinElementID;

        if (join.sourceCollectionID === currentID) {
            joinedID = join.targetCollectionID;
            joinElementID = join.targetElementID;
        }

        if (join.targetCollectionID === currentID) {
            joinedID = join.sourceCollectionID;
            joinElementID = join.sourceElementID;
        }

        if (joinedID && joinedID !== previousID) {
            const result = joinCollections(collectionRef, layer, joinedID, currentID, (safetyCount + 1), warnings);

            if (result.shouldJoin) {
                shouldJoin = true;
                result.node.parentJoin = join;
                const joinElement = findElement(layer.params.schema, joinElementID);
                if (!joinElement) {
                    warnings.push({ msg: 'Unable to join a table due to missing join field' });
                    continue;
                }
                node.joins.push(result.node);
            }
        }
    }

    return {
        shouldJoin: shouldJoin,
        node: node
    };
}

function validateColumn (column, element, warnings) {
    /*
    *
    * The element object was fetched in the database server side, and can be trusted
    * The column object arrives directly from the client, and cannot be trusted
    */

    const validColumn = {
        collectionID: element.collectionID,
        elementID: element.elementID,
        elementName: element.elementName,
        elementType: element.elementType,
        layerID: element.layerID,
        isCustom: Boolean(element.isCustom),
        expression: element.expression,
        viewExpression: element.viewExpression,
        format: column.format || element.format,
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
    if (element.elementType !== 'date') {
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
        const validTextList = [];
        for (const item of filter.criterion.textList) {
            validTextList.push(String(item));
        }
        validFilter.criterion.textList = validTextList;
    }

    return validFilter;
}

function plainText (text, warnings) {
    let secureText;
    try {
        secureText = String(text).replace(/[^a-zA-Z0-9_]/g, '');
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
    const lim = Math.floor(limit);
    if (lim && lim > 0) {
        return lim;
    }
}

function validatePage (page) {
    const validPage = Math.floor(page);
    if (validPage && validPage > 0) {
        return validPage;
    } else {
        return 1;
    }
}
