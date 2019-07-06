var Dashboards = connection.model('Dashboards');

const Controller = require('../../core/controller.js');

class DashboardsController extends Controller {
    constructor () {
        super(Dashboards);
        this.searchFields = [];
    }
}

var controller = new DashboardsController();

exports.DashboardsFindAll = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;

    req.query.fields = ['dashboardName'];

    var perPage = config.get('pagination.itemsPerPage');
    var page = (req.query.page) ? req.query.page : 1;
    var find = { '$and': [{ 'nd_trash_deleted': false }, { 'companyID': 'COMPID' }, { owner: req.user._id }] };
    // var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"},{"$or": [{owner: req.user._id},{owner: { $exists: false }}]}]}
    var fields = { dashboardName: 1, owner: 1, isPublic: 1 };
    var params = {};

    var Dashboards = connection.model('Dashboards');
    Dashboards.find(find, fields, params, function (err, items) {
        if (err) throw err;

        Dashboards.countDocuments(find, function (err, count) {
            if (err) throw err;

            var result = { result: 1, page: page, pages: ((req.query.page) ? Math.ceil(count / perPage) : 1), items: items };
            res.status(200).json(result);
        });
    });
};

exports.DashboardsFindOne = function (req, res) {
    // TODO: Tienes permisos para ejecutar el dashboard

    req.query.trash = true;
    req.query.companyid = true;

    controller.findOne(req, function (result) {
        res.status(200).json(result);
    });
};

exports.DashboardsCreate = function (req, res) {
    if (!req.session.dashboardsCreate && !req.user.isAdmin()) {
        res.status(401).json({ result: 0, msg: 'You don´t have permissions to create dashboards' });
    } else {
        req.query.trash = true;
        req.query.companyid = true;
        req.query.userid = true;

        req.body.owner = req.user._id;
        req.body.isPublic = false;

        req.body.author = req.user.userName;

        controller.create(req, function (result) {
            res.status(200).json(result);
        });
    }
};

exports.DashboardsUpdate = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;

    var data = req.body;

    if (!req.user.isAdmin()) {
        var Dashboards = connection.model('Dashboards');
        Dashboards.findOne({ _id: data._id, owner: req.user._id }, { _id: 1 }, {}, function (err, item) {
            if (err) throw err;
            if (item) {
                controller.update(req, function (result) {
                    res.status(200).json(result);
                });
            } else {
                res.status(401).json({ result: 0, msg: 'You don´t have permissions to update this dashboard' });
            }
        });
    } else {
        controller.update(req, function (result) {
            res.status(200).json(result);
        });
    }
};

exports.DashboardsDelete = function (req, res) {
    var data = req.body;

    req.query.trash = true;
    req.query.companyid = true;

    data._id = data.id;
    data.nd_trash_deleted = true;
    data.nd_trash_deleted_date = new Date();

    req.body = data;

    if (!req.user.isAdmin()) {
        var Dashboards = connection.model('Dashboards');
        Dashboards.findOne({ _id: data._id, owner: req.user._id }, { _id: 1 }, {}, function (err, item) {
            if (err) throw err;
            if (item) {
                controller.update(req, function (result) {
                    res.status(200).json(result);
                });
            } else {
                res.status(401).json({ result: 0, msg: 'You don´t have permissions to delete this dashboard' });
            }
        });
    } else {
        controller.update(req, function (result) {
            res.status(200).json(result);
        });
    }
};

exports.getDashboard = function (req, res) {
    req.query.trash = true;
    var theReports = [];

    // TODO: permissions to execute

    controller.findOne(req, function (result) {
        // identify reports of the dashboard...

        if (result) {
            // Annotate the execution in statistics

            var statistics = connection.model('statistics');
            var stat = {};
            stat.type = 'dashboard';
            stat.relationedID = result.item._id;
            stat.relationedName = result.item.dashboardName;
            if (req.query.linked) { stat.action = 'execute link'; } else { stat.action = 'execute'; }
            statistics.saveStat(req, stat);

            for (var r in result.item.items) {
                if (result.item.items[r].itemType === 'reportBlock') {
                    theReports.push(result.item.items[r].reportID);
                }
                if (result.item.items[r].itemType === 'tabBlock') {
                    // $scope.getTabBlock(result.item.items[r]);
                }
            }

            // Get all the reports...
            var Reports = connection.model('Reports');

            Reports.find({ _id: { $in: theReports } }, function (err, reports) {
                if (err) { console.error(err); }

                if (reports) {
                    for (var r in reports) {
                        for (var i in result.item.items) {
                            if (reports[r]._id === result.item.items[i].reportID) {
                                result.item.items[i].reportDefinition = reports[r];
                            }
                        }
                    }

                    res.status(200).json(result);
                } else {
                // TODO: NO REPORTS FOUND
                }
            });
        } else {
            // TODO: NO DASHBOARD FOUND
        }
    });
};

exports.PublishDashboard = function (req, res) {
    var data = req.body;

    // tiene el usuario conectado permisos para publicar?
    var Dashboards = connection.model('Dashboards');
    var find = { _id: data._id, owner: req.user._id, companyID: req.user.companyID };

    if (req.user.isAdmin()) { find = { _id: data._id, companyID: req.user.companyID }; }

    Dashboards.findOne(find, {}, {}, function (err, Dashboard) {
        if (err) throw err;
        if (Dashboard) {
            Dashboard.isPublic = true;

            Dashboards.updateOne({ _id: data._id }, { $set: Dashboard.toObject() }, function (err, numAffected) {
                if (err) throw err;

                if (numAffected > 0) {
                    res.status(200).json({ result: 1, msg: numAffected + ' dashboard published.' });
                } else {
                    res.status(200).json({ result: 0, msg: 'Error publishing dashboard, no dashboard have been published' });
                }
            });
        } else {
            res.status(401).json({ result: 0, msg: 'You don´t have permissions to publish this dashboard, or this dashboard do not exists' });
        }
    });
};

exports.UnpublishDashboard = function (req, res) {
    var data = req.body;

    // TODO:tiene el usuario conectado permisos para publicar?
    var Dashboards = connection.model('Dashboards');
    var find = { _id: data._id, owner: req.user._id, companyID: req.user.companyID };

    if (req.user.isAdmin()) { find = { _id: data._id, companyID: req.user.companyID }; }

    Dashboards.findOne(find, {}, {}, function (err, Dashboard) {
        if (err) throw err;
        if (Dashboard) {
            Dashboard.isPublic = false;
            Dashboards.updateOne({ _id: data._id }, { $set: Dashboard.toObject() }, function (err, numAffected) {
                if (err) throw err;

                if (numAffected > 0) {
                    res.status(200).json({ result: 1, msg: numAffected + ' dashboard unpublished.' });
                } else {
                    res.status(200).json({ result: 0, msg: 'Error unpublishing dashboard, no dashboard have been unpublished' });
                }
            });
        } else {
            res.status(401).json({ result: 0, msg: 'You don´t have permissions to unpublish this dashboard, or this dashboard do not exists' });
        }
    });
};

exports.ShareDashboard = function (req, res) {
    var data = req.body;
    var parentFolder = data.parentFolder;

    // tiene el usuario conectado permisos para publicar?
    var Dashboards = connection.model('Dashboards');
    var find = { _id: data._id, owner: req.user._id, companyID: req.user.companyID };

    if (req.user.isAdmin()) { find = { _id: data._id, companyID: req.user.companyID }; }

    Dashboards.findOne(find, {}, {}, function (err, Dashboard) {
        if (err) throw err;
        if (Dashboard) {
            Dashboard.parentFolder = parentFolder;
            Dashboard.isShared = true;

            Dashboards.update({ _id: data._id }, { $set: Dashboard.toObject() }, function (err, numAffected) {
                if (err) throw err;

                if (numAffected > 0) {
                    res.status(200).json({ result: 1, msg: numAffected + ' dashboard shared.' });
                } else {
                    res.status(200).json({ result: 0, msg: 'Error sharing dashboard, no dashboard have been shared' });
                }
            });
        } else {
            res.status(401).json({ result: 0, msg: 'You don´t have permissions to shared this dashboard, or this dashboard do not exists' });
        }
    });
};

exports.UnshareDashboard = function (req, res) {
    var data = req.body;

    // TODO:tiene el usuario conectado permisos para publicar?
    var Dashboards = connection.model('Dashboards');
    var find = { _id: data._id, owner: req.user._id, companyID: req.user.companyID };

    if (req.user.isAdmin()) { find = { _id: data._id, companyID: req.user.companyID }; }

    Dashboards.findOne(find, {}, {}, function (err, Dashboard) {
        if (err) throw err;
        if (Dashboard) {
            Dashboard.isShared = false;
            Dashboards.update({ _id: data._id }, { $set: Dashboard.toObject() }, function (err, numAffected) {
                if (err) throw err;

                if (numAffected > 0) {
                    res.status(200).json({ result: 1, msg: numAffected + ' dashboard unshared.' });
                } else {
                    res.status(200).json({ result: 0, msg: 'Error unsharing dashboard, no dashboard have been unshared' });
                }
            });
        } else {
            res.status(401).json({ result: 0, msg: 'You don´t have permissions to unshared this dashboard, or this dashboard do not exists' });
        }
    });
};
