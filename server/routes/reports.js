const express = require('express');
const mongoose = require('mongoose');
const url = require('../helpers/url.js');

const Report = mongoose.model('Report');

const router = express.Router();
router.get('/', function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive()) {
        return res.redirect(url('/login'));
    }

    res.render('report/list');
});

router.get('/view/:reportId', async function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive()) {
        return res.redirect(url('/login'));
    }

    try {
        const report = await Report.findById(req.params.reportId);
        if (!report) {
            return res.sendStatus(404);
        }
        res.render('report/view', { report: report.toObject({ getters: true }) });
    } catch (err) {
        console.error(err.message);
        return res.sendStatus(404);
    }
});

router.get('/edit/:reportId', async function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive()) {
        return res.redirect(url('/login'));
    }

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

router.get('/new', async function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive()) {
        return res.redirect(url('/login'));
    }

    try {
        res.render('report/edit');
    } catch (err) {
        console.error(err.message);
        return res.sendStatus(404);
    }
});

module.exports = router;
