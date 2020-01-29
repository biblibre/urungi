const express = require('express');
const mongoose = require('mongoose');
const mongooseHelper = require('../../helpers/mongoose.js');
const restrict = require('../../middlewares/restrict.js');
const restrictAdmin = require('../../middlewares/restrict-admin.js');

const Layer = mongoose.model('Layer');
const Report = mongoose.model('Report');
const Dashboard = mongoose.model('Dashboard');

const router = express.Router();

router.param('layerId', function (req, res, next, layerId) {
    Layer.findById(layerId).then(layer => {
        if (layer) {
            req.$layer = layer;
            next();
        } else {
            res.sendStatus(404);
        }
    }, err => {
        console.error(err.message);
        res.sendStatus(404);
    });
});

router.get('/', restrict, listLayers);
router.post('/', restrictAdmin, createLayer);
router.get('/:layerId', restrict, getLayer);
router.put('/:layerId', restrictAdmin, replaceLayer);
router.patch('/:layerId', restrictAdmin, updateLayer);
router.delete('/:layerId', restrictAdmin, deleteLayer);

function listLayers (req, res, next) {
    const pipeline = mongooseHelper.getAggregationPipelineFromQuery(req.query);
    Layer.aggregate(pipeline).then(([result]) => {
        res.json(result);
    }).catch(next);
}

function createLayer (req, res, next) {
    const layer = new Layer(req.body);

    layer.save().then(layer => {
        res.status(201).json(layer);
    }).catch(next);
}

function getLayer (req, res) {
    res.json(req.$layer);
}

function replaceLayer (req, res, next) {
    req.$layer.overwrite(req.body);
    req.$layer.save().then(layer => {
        res.json(layer);
    }).catch(next);
}

function updateLayer (req, res, next) {
    req.$layer.set(req.body);
    req.$layer.save().then(layer => {
        res.json(layer);
    }).catch(next);
}

async function deleteLayer (req, res, next) {
    try {
        const reports = await Report.find({ selectedLayerID: req.$layer._id });
        if (reports.length > 0) {
            return res.status(403).json({ error: 'This layer cannot be deleted because at least one report is using it (' + reports.map(report => report.reportName).join(', ') + ')' });
        }

        const dashboards = await Dashboard.find({ 'reports.selectedLayerID': req.$layer._id });
        if (dashboards.length > 0) {
            return res.status(403).json({ error: 'This layer cannot be deleted because at least one dashboard is using it (' + dashboards.map(dashboard => dashboard.dashboardName).join(', ') + ')' });
        }

        await req.$layer.remove();
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
}

module.exports = router;
