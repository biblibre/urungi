const express = require('express');
const mongoose = require('mongoose');
const url = require('../helpers/url.js');
const redirectToLogin = require('../middlewares/redirect-to-login.js');

const Report = mongoose.model('Report');

const router = express.Router();
router.get('/', redirectToLogin, function (req, res) {
    res.render('report/list');
});

router.get('/view/:reportId', async function (req, res) {
    try {
        const report = await Report.findById(req.params.reportId);
        if (!report) {
            return res.sendStatus(404);
        }

        if (!report.isPublic && (!req.isAuthenticated() || !req.user.isActive())) {
            req.session.redirect_url = req.originalUrl;
            return res.redirect(url('/login'));
        }

        const permissions = await req.user.getPermissions();
        const canEdit = permissions.reportsCreate || req.user.id === report.owner;

        res.render('report/view', { report: report.toObject({ getters: true }), canEdit });
    } catch (err) {
        console.error(err.message);
        return res.sendStatus(404);
    }
});

router.get('/edit/:reportId', redirectToLogin, async function (req, res) {
    try {
        const report = await Report.findById(req.params.reportId);
        if (!report) {
            return res.sendStatus(404);
        }
        res.render('report/edit', { report: report.toObject({ getters: true }) });
    } catch (err) {
        console.error(err.message);
        return res.sendStatus(404);
    }
});

router.get('/new', redirectToLogin, async function (req, res) {
    try {
        res.render('report/edit');
    } catch (err) {
        console.error(err.message);
        return res.sendStatus(404);
    }
});

module.exports = router;
