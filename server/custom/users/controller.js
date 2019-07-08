const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const Reports = mongoose.model('Reports');
const Companies = mongoose.model('Companies');
const Roles = mongoose.model('Roles');

const Controller = require('../../core/controller.js');
const { sendEmailTemplate } = require('../../helpers/mailer');

class UsersController extends Controller {
    constructor () {
        super(Users);
        this.searchFields = ['userName'];
    }
}

var controller = new UsersController();

exports.UsersCreate = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.body.companyID = 'COMPID';

    // Do we have to generate a password?
    if (req.body.sendPassword) {
        var generatePassword = require('password-generator');
        var thePassword = generatePassword();
        req.body.pwd1 = thePassword;
        req.body.userPassword = thePassword;
    }

    req.body.status = 'active';
    req.body.nd_trash_deleted = false;

    var Users = mongoose.model('Users');
    Users.createTheUser(req, res, req.body, function (result) {
        if (req.body.sendPassword && typeof thePassword !== 'undefined') {
            var recipients = [];
            recipients.push(req.body);
            sendEmailTemplate('newUserAndPassword', recipients, 'email', 'welcome to urungi');
        }

        res.status(200).json(result);
    });
};

exports.UsersUpdate = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;

    if (req.body.pwd1 && req.body.pwd2) {
        if (req.body.pwd1 === req.body.pwd2) {
            var hash = require('../../util/hash');
            hash(req.body.pwd1, function (err, salt, hash) {
                if (err) throw err;
                req.body.password = '';
                req.body.salt = salt;
                req.body.hash = hash;
                controller.update(req).then(function (result) {
                    res.status(200).json(result);
                });
            });
        } else {
            var result = { result: 0, msg: 'Passwords do not match' };
            res.status(200).json(result);
        }
    } else {
        controller.update(req).then(function (result) {
            res.status(200).json(result);
        });
    }
};

exports.UsersDelete = function (req, res) {
    req.query.trash = true;
    controller.remove(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.UsersFindAll = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;

    controller.findAll(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.UsersFindOne = function (req, res) {
    req.query.companyid = true;

    controller.findOne(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.logout = function (req, res) {
    req.logOut();
    res.clearCookie('remember_me');
    req.session.loggedIn = false;
    req.session = null;
    res.end();
};

exports.changeMyPassword = function (req, res) {
    if (req.body.pwd1 && req.body.pwd2) {
        if (req.body.pwd1 === req.body.pwd2) {
            var hash = require('../../util/hash');
            hash(req.body.pwd1, function (err, salt, hash) {
                if (err) throw err;
                Users.updateOne({ _id: req.user._id }, { salt: salt, hash: hash }, function (err) {
                    if (err) { console.error(err); }

                    const result = { result: 1, msg: 'Password changed' };
                    res.status(200).json(result);
                });
            });
        } else {
            const result = { result: 0, msg: 'Passwords do not match' };
            res.status(200).json(result);
        }
    }
};

exports.changeUserStatus = function (req, res) {
    Users.setStatus(req, function (result) {
        res.status(200).json(result);
    });
};

exports.setViewedContextHelp = function (req, res) {
    Users.setViewedContextHelp(req, function (result) {
        res.status(200).json(result);
    });
};

exports.getCounts = function (req, res) {
    var companyID = req.user.companyID;
    var theCounts = {};

    if (req.user.isAdmin()) {
        // get all reports
        Reports.countDocuments({ companyID: companyID, owner: req.user._id, nd_trash_deleted: false }, function (err, reportCount) {
            if (err) { console.error(err); }

            theCounts.reports = reportCount;
            // get all dashboards
            var Dashboardsv2 = mongoose.model('Dashboardsv2');
            Dashboardsv2.countDocuments({ companyID: companyID, owner: req.user._id, nd_trash_deleted: false }, function (err, dashCount) {
                if (err) { console.error(err); }

                theCounts.dashBoards = dashCount;
                // get all datasources
                var DataSources = mongoose.model('DataSources');
                DataSources.countDocuments({ companyID: companyID, nd_trash_deleted: false }, function (err, dtsCount) {
                    if (err) { console.error(err); }

                    theCounts.dataSources = dtsCount;
                    // get all layers
                    var Layers = mongoose.model('Layers');
                    Layers.countDocuments({ companyID: companyID, nd_trash_deleted: false }, function (err, layersCount) {
                        if (err) { console.error(err); }

                        theCounts.layers = layersCount;
                        // get all users
                        var Users = mongoose.model('Users');
                        Users.countDocuments({ companyID: companyID, nd_trash_deleted: false }, function (err, usersCount) {
                            if (err) { console.error(err); }

                            theCounts.users = usersCount;
                            // get all roles
                            Roles.countDocuments({ companyID: companyID, nd_trash_deleted: false }, function (err, rolesCount) {
                                if (err) { console.error(err); }

                                theCounts.roles = rolesCount;
                                // send the response
                                res.status(200).json(theCounts);
                            });
                        });
                    });
                });
            });
        });
    } else {
        // get all reports
        Reports.countDocuments({ companyID: companyID, owner: req.user._id, nd_trash_deleted: false }, function (err, reportCount) {
            if (err) { console.error(err); }

            theCounts.reports = reportCount;
            // get all dashboards
            var Dashboards = mongoose.model('Dashboardsv2');
            Dashboards.countDocuments({ companyID: companyID, owner: req.user._id, nd_trash_deleted: false }, function (err, dashCount) {
                if (err) { console.error(err); }

                theCounts.dashBoards = dashCount;
                res.status(200).json(theCounts);
            });
        });
    }
};

exports.getCountsForUser = function (req, res) {
    var userID = req.query.userID;
    var companyID = req.user.companyID;
    var theCounts = {};

    // get all reports
    var Reports = mongoose.model('Reports');
    Reports.countDocuments({ companyID: companyID, owner: userID, isShared: true, nd_trash_deleted: false }, function (err, reportCount) {
        if (err) { console.error(err); }

        theCounts.sharedReports = reportCount;
        // get all dashboards
        var Dashboards = mongoose.model('Dashboardsv2');
        Dashboards.countDocuments({ companyID: companyID, owner: userID, isShared: true, nd_trash_deleted: false }, function (err, dashCount) {
            if (err) { console.error(err); }

            theCounts.sharedDashBoards = dashCount;

            Reports.countDocuments({ companyID: companyID, owner: userID, isShared: false, nd_trash_deleted: false }, function (err, privateReportCount) {
                if (err) { console.error(err); }

                theCounts.privateReports = privateReportCount;

                var Dashboards = mongoose.model('Dashboardsv2');
                Dashboards.countDocuments({ companyID: companyID, owner: userID, isShared: false, nd_trash_deleted: false }, function (err, privateDashCount) {
                    if (err) { console.error(err); }

                    theCounts.privateDashBoards = privateDashCount;
                    res.status(200).json(theCounts);
                });
            });
        });
    });
};

exports.getUserReports = function (req, res) {
    var page = (req.query.page) ? req.query.page : 1;
    var userID = req.query.userID;
    var companyID = req.user.companyID;
    var Reports = mongoose.model('Reports');
    Reports.find({ companyID: companyID, owner: userID, nd_trash_deleted: false }, { reportName: 1, parentFolder: 1, isShared: 1, reportType: 1, reportDescription: 1, status: 1 }, function (err, reports) {
        if (err) { console.error(err); }

        res.status(200).json({ result: 1, page: page, pages: 1, items: reports });
    });
};

exports.getUserDashboards = function (req, res) {
    var page = (req.query.page) ? req.query.page : 1;
    var userID = req.query.userID;
    var companyID = req.user.companyID;
    var Dashboards = mongoose.model('Dashboardsv2');
    Dashboards.find({ companyID: companyID, owner: userID, nd_trash_deleted: false }, { dashboardName: 1, parentFolder: 1, isShared: 1, dashboardDescription: 1, status: 1 }, function (err, privateDashCount) {
        if (err) { console.error(err); }

        res.status(200).json({ result: 1, page: page, pages: 1, items: privateDashCount });
    });
};

exports.getUserData = async function (req, res) {
    try {
        const company = await Companies.findOne({ companyID: req.user.companyID, nd_trash_deleted: false });
        const user = {
            companyData: company,
            companyID: req.user.companyID,
            contextHelp: req.user.contextHelp,
            dialogs: req.user.dialogs,
            filters: req.user.filters,
            privateSpace: req.user.privateSpace,
            roles: req.user.roles,
            status: req.user.status,
            userName: req.user.userName,
        };

        let createReports = false;
        let createDashboards = false;
        let exploreData = false;
        let viewSQL = false;
        let shareReports = false;
        let shareDashboards = false;
        let canShare = false;

        if (req.user.isAdmin()) {
            createReports = true;
            createDashboards = true;
            exploreData = true;
            viewSQL = true;
            canShare = true;
            shareReports = true;
            shareDashboards = true;
        } else {
            const roles = await Roles.find({ _id: { $in: req.user.roles } });

            for (const role of roles) {
                if (role.reportsCreate) { createReports = true; }
                if (role.dashboardsCreate) { createDashboards = true; }
                if (role.exploreData) { exploreData = true; }
                if (role.viewSQL) { viewSQL = true; }
                if (role.reportsShare) { shareReports = true; }
                if (role.dashboardsShare) { shareDashboards = true; }
            }
        }

        req.session.reportsCreate = createReports;
        req.session.dashboardsCreate = createDashboards;
        req.session.exploreData = exploreData;
        req.session.viewSQL = viewSQL;
        req.session.canShare = canShare;
        req.session.shareReports = shareReports;
        req.session.shareDashboards = shareDashboards;

        user.reportsCreate = createReports;
        user.dashboardsCreate = createDashboards;
        user.exploreData = exploreData;
        user.viewSQL = viewSQL;
        user.canShare = canShare;
        user.shareReports = shareReports;
        user.shareDashboards = shareDashboards;

        const response = {
            result: 1,
            page: 1,
            pages: 1,
            items: {
                user: user,
                companyData: company,
                rolesData: req.user.roles,
                reportsCreate: createReports,
                dashboardsCreate: createDashboards,
                exploreData: exploreData,
                viewSQL: viewSQL,
            },
        };

        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};
exports.getUserOtherData = function (req, res) {
    var Users = mongoose.model('Users');
    Users.findOne({ _id: req.user._id }, {}, function (err, user) {
        if (err) { console.error(err); }

        res.status(200).json({ result: 1, page: 1, pages: 1, items: user });
    });
};

exports.getUserObjects = async function (req, res) {
    const query = {
        'companyID': req.user.companyID,
        'nd_trash_deleted': false
    };
    const company = await Companies.findOne(query).exec();

    const folders = company.sharedSpace;

    let canShare = false;
    if (req.user.isAdmin()) {
        canShare = true;
        await getFolderStructureForAdmin(folders, 0);
    } else {
        if (req.user.roles.length > 0) {
            const Roles = mongoose.model('Roles');
            const query = {
                '_id': { '$in': req.user.roles },
                'companyID': req.user.companyID
            };
            const roles = await Roles.find(query).lean().exec();

            canShare = await navigateRoles(folders, roles);
        }
    }

    const reports = await getNoFolderReports();
    reports.forEach(report => folders.push(report));

    const dashboards = await getNoFolderDashboards();
    dashboards.forEach(dashboard => folders.push(dashboard));

    const body = {
        result: 1,
        page: 1,
        pages: 1,
        items: folders,
        userCanShare: canShare
    };
    res.status(200).json(body);
};

async function navigateRoles (folders, rolesData) {
    var canShare = false;

    for (const r in rolesData) {
        if (!rolesData[r].grants || rolesData[r].grants.length === 0) {
            rolesData.splice(r, 1);
        }
    }

    for (const r in rolesData) {
        for (const g in rolesData[r].grants) {
            var theGrant = rolesData[r].grants[g];

            const share = await setGrantsToFolder_v2(folders, theGrant);
            if (share) {
                canShare = true;
            }
        }
    }

    return canShare;
}

async function setGrantsToFolder_v2 (folders, grant) {
    var share = false;

    for (var i in folders) {
        const folder = folders[i];
        if (folder.id === grant.folderID) {
            folder.grants = grant;

            if (grant.shareReports === true) {
                share = true;
            }

            const reports = await getReportsForFolder(grant.folderID, grant);
            reports.forEach(report => folder.nodes.push(report));

            const dashboards = await getDashboardsForFolder(grant.folderID, grant);
            dashboards.forEach(dashboard => folder.nodes.push(dashboard));

            return share;
        } else {
            if (folder.nodes && folder.nodes.length > 0) {
                return setGrantsToFolder_v2(folder.nodes, grant);
            }
        }
    }
}

async function getFolderStructureForAdmin (folders, index) {
    const folder = folders[index];

    if (folder) {
        if (!folder.nodes) {
            folder.nodes = [];
        }

        await getFolderStructureForAdmin(folder.nodes, 0);

        folder.grants = {
            folderID: folder.id,
            executeDashboards: true,
            executeReports: true,
            shareReports: true
        };

        const reports = await getReportsForFolder(folder.id, folder.grants);
        reports.forEach(report => folder.nodes.push(report));

        const dashboards = await getDashboardsForFolder(folder.id, folder.grants);
        dashboards.forEach(dashboard => folder.nodes.push(dashboard));

        await getFolderStructureForAdmin(folders, index + 1);
    }
}

async function getReportsForFolder (idfolder, grant) {
    var nodes = [];

    if (!grant || grant.executeReports) {
        const Reports = mongoose.model('Reports');

        const query = {
            'nd_trash_deleted': false,
            'companyID': 'COMPID',
            'parentFolder': idfolder,
            'isShared': true
        };
        const projection = { reportName: 1, reportType: 1, reportDescription: 1 };

        const reports = await Reports.find(query).select(projection).exec();
        nodes = reports.map(report => ({
            id: report._id,
            title: report.reportName,
            nodeType: 'report',
            description: report.reportDescription,
            nodeSubtype: report.reportType,
            nodes: []
        }));
    }

    return nodes;
}

async function getDashboardsForFolder (idfolder, grant) {
    var nodes = [];

    if (!grant || grant.executeDashboards) {
        const Dashboards = mongoose.model('Dashboardsv2');

        const query = {
            'nd_trash_deleted': false,
            'companyID': 'COMPID',
            'parentFolder': idfolder,
            'isShared': true
        };
        const projection = { dashboardName: 1, dashboardDescription: 1 };

        const dashboards = await Dashboards.find(query).select(projection).exec();
        nodes = dashboards.map(dashboard => ({
            id: dashboard._id,
            title: dashboard.dashboardName,
            description: dashboard.dashboardDescription,
            nodeType: 'dashboard',
            nodes: []
        }));
    }

    return nodes;
}

async function getNoFolderReports () {
    return getReportsForFolder('root');
}

async function getNoFolderDashboards () {
    return getDashboardsForFolder('root');
}

exports.getUserLastExecutions = function (req, res) {
    var statistics = mongoose.model('statistics');

    let find;
    if (req.user.isAdmin()) {
        find = { action: 'execute' };
    } else {
        find = { '$and': [{ userID: '' + req.user._id + '' }, { action: 'execute' }] };
    }

    // Last executions

    statistics.aggregate([
        { $match: find },
        { $group: {
            _id: { relationedID: '$relationedID',
                type: '$type',
                relationedName: '$relationedName',
                action: '$action' },
            lastDate: { $max: '$createdOn' }
        } },
        { $sort: { lastDate: -1 } }
    ], function (err, lastExecutions) {
        if (err) {
            console.log(err);
            return;
        }

        statistics.aggregate([
            { $match: find },
            { $group: {
                _id: { relationedID: '$relationedID',
                    type: '$type',
                    relationedName: '$relationedName',
                    action: '$action' },
                count: { $sum: 1 }
            } },
            { $sort: { count: -1 } }
        ], function (err, mostExecuted) {
            if (err) {
                console.log(err);
                return;
            }
            var mergeResults = { theLastExecutions: lastExecutions, theMostExecuted: mostExecuted };
            res.status(200).json({ result: 1, page: 1, pages: 1, items: mergeResults });
        });
    });
};
