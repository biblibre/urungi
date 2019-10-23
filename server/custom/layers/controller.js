const mongoose = require('mongoose');
const Layer = mongoose.model('Layer');
const Controller = require('../../core/controller.js');
class LayersController extends Controller {
    constructor () {
        super(Layer);
        this.searchFields = ['actionCategory'];
    }
}

var controller = new LayersController();

exports.LayersCreate = function (req, res) {
    req.query.trash = true;

    req.user = {};
    req.user.companyID = 'COMPID';
    req.query.companyid = true;
    req.body.companyID = 'COMPID';

    controller.create(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.LayersUpdate = function (req, res) {
    controller.update(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.LayersFindAll = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';
    controller.findAll(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.GetLayers = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    req.query.fields = ['name', 'description', 'objects', 'params.joins'];
    req.query.find = [];
    req.query.find.push({ status: 'active' });

    controller.findAll(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.LayersFindOne = function (req, res) {
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findOne(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.changeLayerStatus = function (req, res) {
    const update = { $set: { status: req.body.status } };
    Layer.findByIdAndUpdate(req.body.layerID, update).then(() => {
        res.sendStatus(204);
    }, err => {
        res.status(500).json({ error: err });
    });
};

exports.LayersDelete = function (req, res) {
    var data = req.body;

    req.query.trash = true;
    req.query.companyid = true;

    data._id = data.id;
    data.nd_trash_deleted = true;
    data.nd_trash_deleted_date = new Date();

    req.body = data;

    var Report = mongoose.model('Report');
    var Dashboard = mongoose.model('Dashboard');

    Report.find({ selectedLayerID: data._id }).then(function (reports) {
        if (reports.length === 0) {
            Dashboard.find({ 'reports.selectedLayerID': data._id, nd_trash_deleted: false }).then(function (dashboard) {
                if (dashboard.length === 0) {
                    if (!req.user.isAdmin()) {
                        var Layer = mongoose.model('Layer');
                        Layer.findOne({ _id: data._id, owner: req.user._id }, { _id: 1 }, {}, function (err, item) {
                            if (err) throw err;
                            if (item) {
                                controller.remove(req).then(function (result) {
                                    res.status(200).json(result);
                                });
                            } else {
                                res.status(401).json({ result: 0, msg: 'You don´t have permissions to delete this layer' });
                            }
                        });
                    } else {
                        controller.remove(req).then(function (result) {
                            res.status(200).json(result);
                        });
                    }
                } else {
                    res.status(200).json({ result: 0, msg: 'This layer cannot be deleted because at least one dashboard is using it (' + dashboard.map(function (dashboard) { return dashboard.dashboardName; }).join(', ') + ')' });
                }
            });
        } else {
            res.status(200).json({ result: 0, msg: 'This layer cannot be deleted because at least one report is using it (' + reports.map(function (reports) { return reports.reportName; }).join(', ') + ')' });
        }
    });
};
