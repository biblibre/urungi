const express = require('express');
const mongoose = require('mongoose');
const url = require('../helpers/url.js');
const redirectToLogin = require('../middlewares/redirect-to-login.js');

const Dashboard = mongoose.model('Dashboard');

const router = express.Router();
router.get('/list', redirectToLogin, function (req, res) {
    res.render('dashboard/list');
});

router.get('/view/:dashboardId', async function (req, res) {
    try {
        const dashboard = await Dashboard.findById(req.params.dashboardId);
        if (!dashboard) {
            return res.sendStatus(404);
        }

        if (!dashboard.isPublic && (!req.isAuthenticated() || !req.user.isActive())) {
            req.session.redirect_url = req.originalUrl;
            return res.redirect(url('/login'));
        }

        res.render('dashboard/view', { dashboard: dashboard.toObject({ getters: true }) });
    } catch (err) {
        console.error(err.message);
        return res.sendStatus(404);
    }
});

router.get('/edit/:dashboardId', redirectToLogin, async function (req, res) {
    try {
        const dashboard = await Dashboard.findById(req.params.dashboardId);
        if (!dashboard) {
            return res.sendStatus(404);
        }
        res.render('dashboard/edit', { dashboard: dashboard.toObject({ getters: true }) });
    } catch (err) {
        console.error(err.message);
        return res.sendStatus(404);
    }
});

router.get('/new', redirectToLogin, async function (req, res) {
    try {
        res.render('dashboard/edit');
    } catch (err) {
        console.error(err.message);
        return res.sendStatus(404);
    }
});

module.exports = router;
