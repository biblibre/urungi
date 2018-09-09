var Dashboardsv2 = connection.model('Dashboardsv2');

const Controller = require('../../core/controller.js');

class Dashboardsv2Controller extends Controller {
    constructor () {
        super(Dashboardsv2);
        this.searchFields = [];
    }
}

var controller = new Dashboardsv2Controller();

exports.Dashboardsv2FindAll = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';
    controller.findAll(req).then(function (result) {
        serverResponse(req, res, 200, result);
    });
};

exports.Dashboardsv2FindOne = function (req, res) {
    // TODO: Are you granted to execute this Dashboard???

    req.query.trash = true;
    req.query.companyid = true;

    controller.findOne(req).then(function (result) {
        serverResponse(req, res, 200, result);
    });
};

exports.Dashboardsv2Create = function (req, res) {
    if (!req.session.Dashboardsv2Create && !req.session.isWSTADMIN) {
        serverResponse(req, res, 401, {result: 0, msg: 'You don´t have permissions to create Dashboards'});
    } else {
        req.query.trash = true;
        req.query.companyid = true;
        req.query.userid = true;

        req.body.owner = req.user._id;
        req.body.isPublic = false;

        req.body.author = req.user.userName;

        controller.create(req).then(function (result) {
            serverResponse(req, res, 200, result);
        });
    }
};

exports.Dashboardsv2Duplicate = function (req, res) {
    if (!req.session.Dashboardsv2Create && !req.session.isWSTADMIN) {
        serverResponse(req, res, 401, {result: 0, msg: 'You don´t have permissions to create Dashboardsv2'});
    } else {
        req.query.trash = true;
        req.query.companyid = true;
        req.query.userid = true;

        delete (req.body._id);
        req.body.dashboardName = 'Copy of ' + req.body.dashboardName;
        req.body.owner = req.user._id;
        req.body.isPublic = false;
        controller.create(req).then(function (result) {
            serverResponse(req, res, 200, result);
        });
    }
};

exports.Dashboardsv2Update = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;

    var data = req.body;

    if (!req.session.isWSTADMIN) {
        var Dashboardsv2 = connection.model('Dashboardsv2');
        Dashboardsv2.findOne({_id: data._id, owner: req.user._id}, {_id: 1}, {}, function (err, item) {
            if (err) throw err;
            if (item) {
                controller.update(req).then(function (result) {
                    serverResponse(req, res, 200, result);
                });
            } else {
                serverResponse(req, res, 401, {result: 0, msg: 'You don´t have permissions to update this Dashboard'});
            }
        });
    } else {
        controller.update(req).then(function (result) {
            serverResponse(req, res, 200, result);
        });
    }
};

exports.Dashboardsv2Delete = function (req, res) {
    var data = req.body;

    req.query.trash = true;
    req.query.companyid = true;

    data._id = data.id;
    data.nd_trash_deleted = true;
    data.nd_trash_deleted_date = new Date();

    req.body = data;

    if (!req.session.isWSTADMIN) {
        var Dashboardsv2 = connection.model('Dashboardsv2');
        Dashboardsv2.findOne({_id: data._id, owner: req.user._id}, {_id: 1}, {}, function (err, item) {
            if (err) throw err;
            if (item) {
                controller.update(req).then(function (result) {
                    serverResponse(req, res, 200, result);
                });
            } else {
                serverResponse(req, res, 401, {result: 0, msg: 'You don´t have permissions to delete this Dashboard'});
            }
        });
    } else {
        controller.update(req).then(function (result) {
            serverResponse(req, res, 200, result);
        });
    }
};

exports.getDashboard = function (req, res) {
    req.query.trash = true;
    var theReports = [];

    // TODO: permissions to execute

    controller.findOne(req).then(function (result) {
        // identify reports of the Dashboard...

        if (result) {
            // Annotate the execution in statistics
            var statistics = connection.model('statistics');
            var stat = {};
            stat.type = 'Dashboard';
            stat.relationedID = result.item._id;
            stat.relationedName = result.item.dashboardName;
            stat.action = 'execute';
            statistics.save(req, stat, function () {

            });

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

            Reports.find({ _id: {$in: theReports} }, function (err, reports) {
                if (err) { console.error(err); }

                if (reports) {
                    for (var r in reports) {
                        for (var i in result.item.items) {
                            if (reports[r]._id === result.item.items[i].reportID) {
                                result.item.items[i].reportDefinition = reports[r];
                            }
                        }
                    }

                    serverResponse(req, res, 200, result);
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
    var parentFolder = data.parentFolder;

    // Has the connected user grants to publish?
    var Dashboardsv2 = connection.model('Dashboardsv2');
    var find = {_id: data._id, owner: req.user._id, companyID: req.user.companyID};

    if (req.session.isWSTADMIN) { find = {_id: data._id, companyID: req.user.companyID}; }

    Dashboardsv2.findOne(find, {}, {}, function (err, Dashboard) {
        if (err) throw err;
        if (Dashboard) {
            Dashboard.parentFolder = parentFolder;
            Dashboard.isPublic = true;

            req.body = Dashboard;

            controller.update(req).then(function (result) {
                serverResponse(req, res, 200, result);
            });
        } else {
            serverResponse(req, res, 401, {result: 0, msg: 'You don´t have permissions to publish this Dashboard, or this Dashboard do not exists'});
        }
    });
};

exports.UnpublishDashboard = function (req, res) {
    var data = req.body;

    // TODO:tiene el usuario conectado permisos para publicar?
    var Dashboardsv2 = connection.model('Dashboardsv2');
    var find = {_id: data._id, owner: req.user._id, companyID: req.user.companyID};

    if (req.session.isWSTADMIN) { find = {_id: data._id, companyID: req.user.companyID}; }

    Dashboardsv2.findOne(find, {}, {}, function (err, Dashboard) {
        if (err) throw err;
        if (Dashboard) {
            Dashboard.isPublic = false;

            req.body = Dashboard;

            controller.update(req).then(function (result) {
                serverResponse(req, res, 200, result);
            });
        } else {
            serverResponse(req, res, 401, {result: 0, msg: 'You don´t have permissions to unpublish this Dashboard, or this Dashboard do not exists'});
        }
    });
};
