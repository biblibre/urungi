const mongoose = require('mongoose');
var DataSources = mongoose.model('DataSources');
const Controller = require('../../core/controller.js');
const Db = require('../../core/connection').Db;

class DataSourcesController extends Controller {
    constructor () {
        super(DataSources);
        this.searchFields = ['actionCategory'];
    }
}

var controller = new DataSourcesController();

exports.DataSourcesCreate = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.body.companyID = 'COMPID';

    controller.create(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.DataSourcesUpdate = function (req, res) {
    controller.update(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.getEntities = async function (req, res) {
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    let result = await controller.findOne(req);
    if (result.result !== 1) {
        res.status(200).json(result);
        return;
    }

    const dts = result.item;

    const db = new Db(dts);

    result = await db.getCollections();

    db.close();

    res.status(200).json(result);
};

exports.testConnection = async function (req, res) {
    req.body.companyID = req.user.companyID;

    switch (req.body.type) {
    case 'MySQL' : case 'POSTGRE': case 'ORACLE': case 'MSSQL':

        const connectionParams = req.body;

        const con = require('../../core/connection');

        const result = await con.testConnection(connectionParams);

        res.status(200).json(result);
        break;

    default:
        res.status(200).json({ result: 0, msg: 'Invalid database type' });
        break;
    };
};

exports.getEntitySchema = async function (req, res) {
    var theDatasourceID = req.query.datasourceID;
    var theEntity = JSON.parse(req.query.entity);
    req.query = {};
    req.query.companyid = true;
    req.query.id = theDatasourceID;

    req.user = {};
    req.user.companyID = 'COMPID';

    const result = await controller.findOne(req);

    if (result.result !== 1) {
        res.status(200).json(result);
        return;
    }

    const dts = result.item;

    var collectionSchema;

    switch (dts.type) {
    case 'POSTGRE': case 'MySQL': case 'ORACLE': case 'MSSQL':

        const db = new Db(dts);

        const rawSchema = await db.getSchema(theEntity);

        if (rawSchema.result !== 1) {
            res.status(200).json(rawSchema);
            db.close();
            return;
        }

        collectionSchema = processCollectionSchema(theEntity, rawSchema.items);

        db.close();

        res.status(200).json({ result: 1, schema: collectionSchema });

        break;

    default:
        res.status(200).json({ result: 0, msg: 'Invalid database type' });
    }
};

exports.getsqlQuerySchema = async function (req, res) {
    var theDatasourceID = req.query.datasourceID;
    var collectionRef = JSON.parse(req.query.collection);

    req.query = {};
    req.query.companyid = true;
    req.query.id = theDatasourceID;

    req.user = {};
    req.user.companyID = 'COMPID';

    let result = await controller.findOne(req);

    if (result.result !== 1) {
        res.status(200).json(result);
        return;
    }

    try {
        const connection = result.item.connection;

        const data = {
            type: result.item.type,
            connection: {
                host: connection.host,
                port: connection.port,
                userName: connection.userName,
                password: connection.password,
                database: connection.database
            }
        };

        const db = new Db(data);
        const queryResult = await db.executeRawQuery(collectionRef.sqlQuery);

        db.close();

        if (!queryResult) {
            result = { result: 1, isValid: false };
            res.status(200).json(result);
            return;
        }

        const collection = processSqlQuerySchema(collectionRef, queryResult);

        result = { result: 1, isValid: true, schema: collection };

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(200).json({ result: 0, msg: String(err) });
    }
};

exports.DataSourcesFindAll = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findAll(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.DataSourcesFindOne = function (req, res) {
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findOne(req).then(function (result) {
        res.status(200).json(result);
    });
};

function processCollectionSchema (collectionRef, items) {
    /*
    * items is a list of all the columns in a given table. Each item has the following fields (queried from the SQL information table, sometimes renamed):
    *   'table_schema'
    *   'table_name'
    *   'column_name'
    *   'data_type'
    * Only column_name and data_type are useful
    */

    var collection = {
        collectionName: collectionRef.name,
        visible: true,
        collectionLabel: collectionRef.name
    };

    collection.elements = [];

    for (const item of items) {
        var type;

        switch (item.data_type) {
        case 'smallint': case 'integer': case 'bigint': case 'number':
        case 'decimal': case 'numeric': case 'real': case 'double precision':
        case 'serial': case 'bigserial': case 'money':
            type = 'number';
            break;

        case 'timestamp without time zone': case 'timestamp with time zone':
        case 'date': case 'time without time zone': case 'time with time zone':
        case 'abstime': case 'interval': case 'timestamp':
            type = 'date';
            break;

        case 'boolean':
            type = 'boolean';
            break;

        default:
            type = 'string';
        }

        const element = {
            elementName: item.column_name,
            elementType: type,
            visible: true,
            elementLabel: item.column_name,
            data_type: item.data_type
        };

        collection.elements.push(element);
    }

    return collection;
}

function processSqlQuerySchema (collectionRef, queryResult) {
    var collection = {
        collectionName: collectionRef.name,
        visible: true,
        collectionLabel: collectionRef.name,
        isSQL: true,
        sqlQuery: collectionRef.sqlQuery
    };

    collection.elements = [];

    for (var key in queryResult[0]) {
        var name = key;
        var type = 'string';

        if (typeof (queryResult[0][key]) === 'number') {
            if (isNaN(queryResult[0][key]) === false) { type = 'number'; }
        }

        // TODO: type = 'date'; json type = object , NaN = false

        if (typeof (queryResult[0][key]) === 'boolean') { type = 'boolean'; }

        var isVisible = true;

        if (name !== 'wst_rnum') {
            collection.elements.push({
                elementName: name,
                elementType: type,
                visible: isVisible,
                elementLabel: name
            });
        }
    }

    return collection;
}
