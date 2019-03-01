var Layers = connection.model('Layers');
const Controller = require('../../core/controller.js');
class LayersController extends Controller {
    constructor () {
        super(Layers);
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
    req.query.find.push({status: 'active'});

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
    Layers.setStatus(req, function (result) {
        res.status(200).json(result);
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

    var Reports = connection.model('Reports');
    var Dashboardsv2 = connection.model('Dashboardsv2');

    Reports.find({selectedLayerID: data._id}).then(function (reports) {
        if (reports.length === 0) {
            Dashboardsv2.find({'reports.selectedLayerID': data._id, 'nd_trash_deleted': false}).then(function (dashboard) {
                if (dashboard.length === 0) {
                    if (!req.session.isWSTADMIN) {
                        var Layers = connection.model('Layers');
                        Layers.FindOne({_id: data._id, owner: req.user._id}, {_id: 1}, {}, function (err, item) {
                            if (err) throw err;
                            if (item) {
                                controller.remove(req).then(function (result) {
                                    res.status(200).json(result);
                                });
                            } else {
                                res.status(401).json({result: 0, msg: 'You don´t have permissions to delete this layer'});
                            }
                        });
                    } else {
                        controller.remove(req).then(function (result) {
                            res.status(200).json(result);
                        });
                    }
                } else {
                    res.status(200).json({result: 0, msg: 'This layer cannot be deleted because at least one dashboard is using it (' + dashboard.map(function (dashboard) { return dashboard.dashboardName; }).join(', ') + ')'});
                }
            });
        } else {
            res.status(200).json({result: 0, msg: 'This layer cannot be deleted because at least one report is using it (' + reports.map(function (reports) { return reports.reportName; }).join(', ') + ')'});
        }
    });
};
