const express = require('express');
const mongoose = require('mongoose');
const restrictAdmin = require('../../middlewares/restrict-admin.js');
const mongooseHelper = require('../../helpers/mongoose.js');
const DatabaseClient = require('../../core/database-client.js');

const router = express.Router();
const Datasource = mongoose.model('Datasource');

router.use(restrictAdmin);

router.param('datasourceId', function (req, res, next, datasourceId) {
    Datasource.findById(datasourceId).then(datasource => {
        if (!datasource) {
            return res.sendStatus(404);
        }

        req.$datasource = datasource;
        next();
    }, () => {
        res.sendStatus(404);
    });
});

router.get('/', getDatasources);
router.post('/', createDatasource);
router.get('/:datasourceId', getDatasource);
router.patch('/:datasourceId', updateDatasource);
router.get('/:datasourceId/collections', getDatasourceCollections);
router.get('/:datasourceId/collections/:collectionName', getDatasourceCollection);
router.get('/:datasourceId/sql-query-collection', getSqlQueryCollection);

function getDatasources (req, res, next) {
    const pipeline = mongooseHelper.getAggregationPipelineFromQuery(req.query);
    Datasource.aggregate(pipeline).then(([result]) => {
        res.json(result);
    }).catch(next);
}

function createDatasource (req, res, next) {
    const datasource = new Datasource(req.body);
    datasource.createdBy = req.user.id;

    datasource.save().then(datasource => {
        res.status(201).json(datasource);
    }).catch(next);
}

function getDatasource (req, res, next) {
    res.json(req.$datasource);
}

function updateDatasource (req, res, next) {
    req.$datasource.set(req.body);
    req.$datasource.save().then(datasource => {
        res.json(datasource);
    }).catch(next);
}

function getDatasourceCollections (req, res, next) {
    const dbClient = DatabaseClient.fromDatasource(req.$datasource);
    dbClient.getCollectionNames().then(collections => {
        res.json({ data: collections });
    }).catch(next);
}

function getDatasourceCollection (req, res, next) {
    const dbClient = DatabaseClient.fromDatasource(req.$datasource);
    const collectionName = req.params.collectionName;

    dbClient.getCollectionSchema(req.params.collectionName).then(schema => {
        const collection = {
            collectionName: collectionName,
            collectionLabel: collectionName,
            elements: schema.columns.map(column => ({
                elementName: column.name,
                elementLabel: column.name,
                elementType: column.type,
            })),
        };

        res.json(collection);
    }).catch(next);
}

function getSqlQueryCollection (req, res, next) {
    const dbClient = DatabaseClient.fromDatasource(req.$datasource);
    const collectionName = req.query.collectionName;

    dbClient.getSqlQuerySchema(req.query.sqlQuery).then(schema => {
        const collection = {
            collectionLabel: collectionName,
            collectionName: collectionName,
            isSQL: true,
            sqlQuery: req.query.sqlQuery,
            elements: schema.columns.map(column => ({
                elementName: column.name,
                elementLabel: column.name,
                elementType: column.type,
            })),
        };

        res.json(collection);
    }, function (err) {
        res.status(500).json({ error: err.message });
    }).catch(next);
}

module.exports = router;
