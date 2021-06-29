const mongoose = require('mongoose');
const Dashboard = mongoose.model('Dashboard');

const Controller = require('../../core/controller.js');

class DashboardsController extends Controller {
    constructor () {
        super(Dashboard);
        this.searchFields = [];
    }
}

var controller = new DashboardsController();

exports.DashboardsFindAll = function (req, res) {
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';
    controller.findAll(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.DashboardsFindOne = function (req, res) {
    // TODO: Are you granted to execute this Dashboard???

    req.query.companyid = true;

    controller.findOne(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.DashboardsCreate = function (req, res) {
    req.user.getPermissions().then(permissions => {
        if (!permissions.dashboardsCreate && !req.user.isAdmin()) {
            res.status(401).json({ result: 0, msg: 'You do not have permissions to create dashboards' });
        } else {
            req.query.companyid = true;
            req.query.userid = true;

            req.body.owner = req.user._id;
            req.body.isPublic = false;
            req.body.isShared = false;

            req.body.author = req.user.userName;

            controller.create(req).then(function (result) {
                res.status(200).json(result);
            });
        }
    });
};

exports.DashboardsUpdate = function (req, res) {
    req.query.companyid = true;

    var data = req.body;

    if (!req.user.isAdmin()) {
        Dashboard.findOne({ _id: data._id, owner: req.user._id }, { _id: 1 }, {}, function (err, item) {
            if (err) throw err;
            if (item) {
                controller.update(req).then(function (result) {
                    res.status(200).json(result);
                });
            } else {
                res.status(401).json({ result: 0, msg: 'You do not have permissions to update this dashboard' });
            }
        });
    } else {
        controller.update(req).then(function (result) {
            res.status(200).json(result);
        });
    }
};

exports.DashboardsDelete = async function (req, res) {
    const dashboard = await getDashboardFromRequest(req);
    if (dashboard) {
        dashboard.remove().then(() => {
            res.status(200).json({ result: 1, msg: 'Dashboard deleted' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error deleting dashboard' });
        });
    } else {
        res.status(404).json({
            result: 0,
            msg: 'This dashboard does not exist',
        });
    }
};

exports.getDashboard = function (req, res) {
    Dashboard.findById(req.params.id).populate('reports.selectedLayerID').then(dashboard => {
        if (!dashboard || (!dashboard.isPublic && !req.isAuthenticated())) {
            return res.status(403).send('Forbidden');
        }

        // Annotate the execution in statistics
        const Statistic = mongoose.model('Statistic');
        var stat = {};
        stat.type = 'dashboard';
        stat.relationedID = dashboard._id;
        stat.relationedName = dashboard.dashboardName;
        stat.action = 'execute';
        Statistic.saveStat(req, stat);

        res.status(200).json({ result: 1, item: dashboard.toObject({ getters: true, depopulate: true }) });
    }, err => {
        res.status(200).json({ result: 0, msg: 'Database error : ' + err.message });
    });
};

exports.PublishDashboard = async function (req, res) {
    // TODO: Check if the connected user has the permission to publish
    const dashboard = await getDashboardFromRequest(req);
    if (dashboard) {
        dashboard.publish().then(() => {
            res.status(200).json({ result: 1, msg: 'Dashboard published' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error publishing dashboard' });
        });
    } else {
        res.status(404).json({
            result: 0,
            msg: 'This dashboard does not exist',
        });
    }
};

exports.UnpublishDashboard = async function (req, res) {
    // TODO: Check if logged in user has the permission to publish
    const dashboard = await getDashboardFromRequest(req);
    if (dashboard) {
        dashboard.unpublish().then(() => {
            res.status(200).json({ result: 1, msg: 'Dashboard unpublished' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error unpublishing dashboard' });
        });
    } else {
        res.status(404).json({
            result: 0,
            msg: 'This dashboard does not exist',
        });
    }
};

exports.ShareDashboard = async function (req, res) {
    // TODO: Check if the connected user has the permission to share
    const dashboard = await getDashboardFromRequest(req);
    if (dashboard) {
        dashboard.share(req.body.parentFolder).then(() => {
            res.status(200).json({ result: 1, msg: 'Dashboard shared' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error sharing dashboard' });
        });
    } else {
        res.status(404).json({
            result: 0,
            msg: 'This dashboard does not exist',
        });
    }
};

exports.UnshareDashboard = async function (req, res) {
    // TODO: Check if logged in user has the permission to share
    const dashboard = await getDashboardFromRequest(req);
    if (dashboard) {
        dashboard.unshare().then(() => {
            res.status(200).json({ result: 1, msg: 'Dashboard unshared' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error unsharing dashboard' });
        });
    } else {
        res.status(404).json({
            result: 0,
            msg: 'This dashboard does not exist',
        });
    }
};

function getDashboardFromRequest (req) {
    const conditions = {
        _id: req.body._id || req.body.id,
        companyID: req.user.companyID,
    };

    if (!req.user.isAdmin()) {
        conditions.owner = req.user._id;
    }

    return Dashboard.findOne(conditions).exec();
}
