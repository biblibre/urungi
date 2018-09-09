var Reports = connection.model('Reports');

const Controller = require('../../core/controller.js');
const QueryProcessor = require('../../core/queryProcessor');

class ReportsController extends Controller {
    constructor () {
        super(Reports);
        this.searchFields = ['reportName'];
    }
}

var controller = new ReportsController();

exports.ReportsFindAll = async function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';
    const result = await controller.findAll(req);
    res.status(200).json(result);
};

exports.GetReport = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;

    controller.findOne(req).then(function (result) {
        res.status(200).json(result);
        if ((req.query.mode === 'execute' || req.query.mode === 'preview') && result.item) {
            // Note the execution in statistics
            var statistics = connection.model('statistics');
            var stat = {};
            stat.type = 'report';
            stat.relationedID = result.item._id;
            stat.relationedName = result.item.reportName;

            if (req.query.linked === true) { stat.action = 'execute link'; } else { stat.action = 'execute'; }
            statistics.save(req, stat, function () {

            });
        }
    });
};

exports.ReportsFindOne = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;

    controller.findOne(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.ReportsCreate = function (req, res) {
    if (!req.session.reportsCreate && !req.session.isWSTADMIN) {
        res.status(401).json({result: 0, msg: 'You do not have permissions to create reports'});
    } else {
        req.query.trash = true;
        req.query.companyid = true;
        req.query.userid = true;

        req.body.owner = req.user._id;
        req.body.isPublic = false;

        req.body.author = req.user.userName;

        controller.create(req).then(function (result) {
            res.status(200).json(result);
        });
    }
};

exports.ReportsUpdate = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    var data = req.body;

    if (!req.session.isWSTADMIN) {
        var Reports = connection.model('Reports');
        Reports.findOne({_id: data._id, owner: req.user._id, companyID: req.user.companyID}, {_id: 1}, {}, function (err, item) {
            if (err) throw err;
            if (item) {
                controller.update(req).then(function (result) {
                    res.status(200).json(result);
                });
            } else {
                res.status(401).json({result: 0, msg: 'You don´t have permissions to update this report, or this report do not exists'});
            }
        });
    } else {
        controller.update(req).then(function (result) {
            res.status(200).json(result);
        });
    }
};

exports.PublishReport = function (req, res) {
    var data = req.body;
    var parentFolder = data.parentFolder;

    // have the connected user permissions to publish?
    var Reports = connection.model('Reports');
    var find = {_id: data._id, owner: req.user._id, companyID: req.user.companyID};

    if (req.session.isWSTADMIN) { find = {_id: data._id, companyID: req.user.companyID}; }

    Reports.findOne(find, {}, {}, function (err, report) {
        if (err) throw err;
        if (report) {
            report.parentFolder = parentFolder;
            report.isPublic = true;

            req.body = report;

            controller.update(req).then(function (result) {
                res.status(200).json(result);
            });
        } else {
            res.status(401).json({result: 0, msg: 'You don´t have permissions to publish this report, or this report do not exists'});
        }
    });
};

exports.UnpublishReport = function (req, res) {
    var data = req.body;

    // TODO:tiene el usuario conectado permisos para publicar?
    var Reports = connection.model('Reports');
    var find = {_id: data._id, owner: req.user._id, companyID: req.user.companyID};

    if (req.session.isWSTADMIN) { find = {_id: data._id, companyID: req.user.companyID}; }

    Reports.findOne(find, {}, {}, function (err, report) {
        if (err) throw err;
        if (report) {
            report.isPublic = false;

            req.body = report;

            controller.update(req).then(function (result) {
                res.status(200).json(result);
            });
        } else {
            res.status(401).json({result: 0, msg: 'You don´t have permissions to unpublish this report, or this report do not exists'});
        }
    });
};

exports.ReportsDelete = function (req, res) {
    var data = req.body;

    req.query.trash = true;
    req.query.companyid = true;

    data._id = data.id;
    data.nd_trash_deleted = true;
    data.nd_trash_deleted_date = new Date();

    req.body = data;

    if (!req.session.isWSTADMIN) {
        var Reports = connection.model('Reports');
        Reports.findOne({_id: data._id, owner: req.user._id}, {_id: 1}, {}, function (err, item) {
            if (err) throw err;
            if (item) {
                controller.remove(req).then(function (result) {
                    res.status(200).json(result);
                });
            } else {
                res.status(401).json({result: 0, msg: 'You don´t have permissions to delete this report'});
            }
        });
    } else {
        controller.remove(req).then(function (result) {
            res.status(200).json(result);
        });
    }
};

exports.ReportsGetData = async function (req, res) {
    var data = req.body;
    var query = data.query;
    // processDataSources(req, query.datasources, query.layers, {page: (data.page) ? data.page : 1}, query, function (result) {
    //     res.status(200).json(result);
    // });
    var result;
    try {
        result = await QueryProcessor.execute(query);
    } catch (err) {
        console.error(err);
        result = {result: 0, msg: (err.msg) ? err.msg : String(err), error: err};
    }
    res.status(200).json(result);
};
