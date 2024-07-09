const express = require('express');
const mongoose = require('mongoose');
const restrict = require('../../middlewares/restrict');

const User = mongoose.model('User');
const Datasource = mongoose.model('Datasource');
const Role = mongoose.model('Role');
const Layer = mongoose.model('Layer');
const Company = mongoose.model('Company');
const Report = mongoose.model('Report');
const Dashboard = mongoose.model('Dashboard');

const router = express.Router();

router.use(restrict);

router.get('/', getUser);
router.put('/password', updateUserPassword);
router.get('/counts', getCounts);
router.get('/objects', getObjects);
router.put('/context-help/:name', setContextHelp);
router.post('/logout', logout);

async function getUser (req, res) {
    const user = req.user.toObject();
    req.user.getPermissions().then(permissions => {
        Object.assign(user, permissions);

        res.json(user);
    });
}

async function updateUserPassword (req, res) {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const validUser = await new Promise((resolve, reject) => {
        User.isValidUserPassword(req.user.userName, oldPassword, (err, user) => {
            if (err) {
                reject(err);
            } else {
                resolve(user);
            }
        });
    });
    if (validUser) {
        validUser.password = newPassword;
        validUser.save().then(user => {
            res.status(200).json(user.toObject());
        }, err => {
            res.status(500).json({ error: err.message });
        });
    } else {
        res.status(401).json({ error: 'Old password incorrect' });
    }
}

function getCounts (req, res) {
    const promises = [
        req.user.getReports().countDocuments(),
        req.user.getDashboards().countDocuments(),
    ];

    if (req.user.isAdmin()) {
        promises.push(
            Datasource.countDocuments(),
            Layer.countDocuments(),
            User.countDocuments(),
            Role.countDocuments(),
        );
    }

    Promise.all(promises).then(counts => {
        const [reports, dashboards, datasources, layers, users, roles] = counts;

        res.json({ reports, dashboards, datasources, layers, users, roles });
    });
}

async function getObjects (req, res) {
    const roles = await req.user.getRoles();
    const company = await Company.findOne({ companyID: 'COMPID' });
    const folders = company.sharedSpace;

    const foldersList = [];

    folders.forEach(function setGrant (folder) {
        if (req.user.isAdmin()) {
            folder.grants = {
                shareReports: true,
                executeReports: true,
                executeDashboards: true,
            };
        } else {
            folder.grants = {
                shareReports: roles.some(role => role.canShareReportsInFolder(folder.id)),
                executeReports: roles.some(role => role.canExecuteReportsInFolder(folder.id)),
                executeDashboards: roles.some(role => role.canExecuteDashboardsInFolder(folder.id)),
            };
        }

        if (folder.nodes) {
            folder.nodes.forEach(setGrant);
        }

        foldersList.push(folder);
    });

    function getReportNode (report) {
        return {
            id: report._id,
            title: report.reportName,
            nodeType: 'report',
            nodes: [],
        };
    }

    function getDashboardNode (dashboard) {
        return {
            id: dashboard._id,
            title: dashboard.dashboardName,
            nodeType: 'dashboard',
            nodes: [],
        };
    }

    for (const folder of foldersList) {
        if (folder.grants.executeReports) {
            const reports = await Report.find().byFolder(folder.id);
            reports.forEach(report => folder.nodes.push(getReportNode(report)));
        }
        if (folder.grants.executeDashboards) {
            const dashboards = await Dashboard.find().byFolder(folder.id);
            dashboards.forEach(dashboard => folder.nodes.push(getDashboardNode(dashboard)));
        }
    }

    const reports = await Report.find().byFolder('root');
    reports.forEach(report => folders.push(getReportNode(report)));
    const dashboards = await Dashboard.find().byFolder('root');
    dashboards.forEach(dashboard => folders.push(getDashboardNode(dashboard)));

    res.json({ items: folders });
}

function setContextHelp (req, res) {
    const update = { $addToSet: { contextHelp: req.params.name } };
    User.findByIdAndUpdate(req.user._id, update, { new: true }).then(user => {
        res.json({ items: user.contextHelp });
    }, err => {
        res.status(500).json({ error: err.message });
    });
}

function logout (req, res) {
    req.logOut(() => {
        res.sendStatus(204);
    });
}

module.exports = router;
