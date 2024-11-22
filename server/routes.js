const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const url = require('./helpers/url.js');
const redirectToLogin = require('./middlewares/redirect-to-login.js');

const Statistic = mongoose.model('Statistic');
const Layer = mongoose.model('Layer');
const Report = mongoose.model('Report');
const Dashboard = mongoose.model('Dashboard');
const Datasource = mongoose.model('Datasource');

const router = express.Router();

router.use(function (req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken(), { sameSite: true });

    next();
});

router.get('/', redirectToLogin, async function (req, res) {
    const conditions = {};
    if (!req.user.isAdmin()) {
        conditions.userID = req.user.id;
    }
    res.locals.lastExecutions = await Statistic.getLastExecutions(conditions);
    res.locals.mostExecutions = await Statistic.getMostExecutions(conditions);
    res.render('home');
});

router.get('/login', function (req, res) {
    if (req.isAuthenticated() && req.user.isActive()) {
        return res.redirect(url('/'));
    }

    res.locals.csrf = req.csrfToken();
    res.render('login');
});

const createFirstUser = async function (req, res, next) {
    const mongoose = require('mongoose');
    const User = mongoose.model('User');
    const Company = mongoose.model('Company');
    try {
        const usersCount = await User.countDocuments({});
        if (usersCount === 0) {
            await Company.create({ companyID: 'COMPID', createdBy: 'urungi setup', nd_trash_deleted: false });
            const adminUser = new User();
            adminUser.userName = 'administrator';
            adminUser.password = 'urungi';
            adminUser.companyID = 'COMPID';
            adminUser.roles = [];
            adminUser.roles.push('ADMIN');
            adminUser.status = 'active';
            adminUser.nd_trash_deleted = false;

            await adminUser.save();
        }
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
    next();
};
const saveOldSession = function (req, res, next) {
    req.oldSession = req.session;
    next();
}
const authenticate = passport.authenticate('local', {
    failureRedirect: url('/login'),
    failureFlash: true,
});
router.post('/login', createFirstUser, saveOldSession, authenticate, async function (req, res) {
    req.user.last_login_date = new Date();
    req.user.last_login_ip =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    await req.user.save();

    const redirect_url = req.oldSession.redirect_url;
    if (redirect_url && redirect_url.startsWith('/')) {
        res.redirect(url(redirect_url));
    } else {
        res.redirect(url('/'));
    }
});

router.get('/logout', function (req, res) {
    req.logout(() => {
        res.redirect(url('/login'));
    });
});

router.get('/about', redirectToLogin, function (req, res) {
    const version = require('../package.json').version;
    const child_process = require('child_process');

    let gitVersion;
    const result = child_process.spawnSync('git', ['describe', '--dirty']);
    if (result.status === 0) {
        gitVersion = result.stdout.toString().trim();
    }

    res.render('about', { version, gitVersion });
});

router.get('/shared-space', redirectToLogin, function (req, res) {
    res.render('shared-space');
});

router.use('/dashboards', require('./routes/dashboards.js'));
router.use('/reports', require('./routes/reports.js'));
router.use('/explore', function (req, res) {
    res.redirect(url('/reports/new'));
});
router.use('/layers', require('./routes/layers.js'));
router.use('/data-sources', require('./routes/data-sources.js'));
router.use('/roles', require('./routes/roles.js'));
router.use('/users', require('./routes/users.js'));

router.get('/import', redirectToLogin, function (req, res, next) {
    if (!req.user.isAdmin()) {
        return res.sendStatus(403);
    }
    res.render('import');
});

router.get('/export', redirectToLogin, function (req, res) {
    if (!req.user.isAdmin()) {
        return res.sendStatus(403);
    }

    Promise.all([Layer.find(), Report.find(), Dashboard.find()]).then(function (values) {
        const [layers, reports, dashboards] = values.map(models => {
            return models.map(model => {
                return model.toObject({ getters: true });
            });
        });

        res.locals.csrf = req.csrfToken();
        res.render('export', { layers, reports, dashboards });
    });
});

router.post('/export', redirectToLogin, async function (req, res, next) {
    if (!req.user.isAdmin()) {
        return res.sendStatus(403);
    }

    try {
        const layer_ids = new Set(req.body.layer_ids);
        const report_ids = new Set(req.body.report_ids);
        const dashboard_ids = new Set(req.body.dashboard_ids);

        const [reports, dashboards] = await Promise.all([
            Report.find({ _id: { $in: Array.from(report_ids) } }),
            Dashboard.find({ _id: { $in: Array.from(dashboard_ids) } })
        ]);

        for (const report of reports) {
            layer_ids.add(report.selectedLayerID);
        }
        for (const dashboard of dashboards) {
            for (const report of dashboard.reports) {
                layer_ids.add(report.selectedLayerID);
            }
        }

        const layers = await Layer.find({ _id: { $in: Array.from(layer_ids) } });
        const datasource_ids = new Set();
        for (const layer of layers) {
            datasource_ids.add(layer.datasourceID);
        }

        const datasources = await Datasource.find({ _id: { $in: Array.from(datasource_ids) } });

        res.set('Content-Disposition', 'attachment; filename="' + req.body.exportName + '.json"');
        res.json({ layers, reports, dashboards, datasources });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
