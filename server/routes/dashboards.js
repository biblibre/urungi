const express = require('express');
const mongoose = require('mongoose');
const url = require('../helpers/url.js');

const Dashboard = mongoose.model('Dashboard');

const router = express.Router();
router.get('/list', function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive()) {
        return res.redirect(url('/login'));
    }

    res.render('dashboard/list');
});

router.get('/view/:dashboardId', async function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive()) {
        return res.redirect(url('/login'));
    }

    try {
        const dashboard = await Dashboard.findById(req.params.dashboardId);
        if (!dashboard) {
            return res.sendStatus(404);
        }
        res.render('dashboard/view', { dashboard: dashboard.toObject({ getters: true }) });
    } catch (err) {
        console.error(err.message);
        return res.sendStatus(404);
    }
});

router.get('/edit/:dashboardId', async function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive()) {
        return res.redirect(url('/login'));
    }

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

router.get('/new', async function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive()) {
        return res.redirect(url('/login'));
    }

    try {
        res.render('dashboard/edit');
    } catch (err) {
        console.error(err.message);
        return res.sendStatus(404);
    }
});

module.exports = router;
