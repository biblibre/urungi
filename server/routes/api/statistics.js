const express = require('express');
const mongoose = require('mongoose');
const restrict = require('../../middlewares/restrict');

const router = express.Router();
const Statistic = mongoose.model('Statistic');

router.use(restrict);

router.get('/last-executions', getLastExecutions);
router.get('/most-executed', getMostExecuted);

function getLastExecutions (req, res) {
    const conditions = {};
    if (!req.user.isAdmin()) {
        conditions.userID = req.user.id;
    }
    Statistic.getLastExecutions(conditions).then(items => {
        res.json({ items });
    });
}

function getMostExecuted (req, res) {
    const conditions = {};
    if (!req.user.isAdmin()) {
        conditions.userID = req.user.id;
    }
    Statistic.getMostExecutions(conditions).then(items => {
        res.json({ items });
    });
}

module.exports = router;
