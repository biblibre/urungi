const express = require('express');
const mongoose = require('mongoose');
const restrict = require('../../middlewares/restrict');

const router = express.Router();
const Statistic = mongoose.model('Statistic');

router.use(restrict);

router.get('/last-executions', getLastExecutions);
router.get('/most-executed', getMostExecuted);

function getLastExecutions (req, res) {
    const conditions = { action: 'execute' };
    if (!req.user.isAdmin()) {
        conditions.userID = req.user.id;
    }

    const pipeline = [
        { $match: conditions },
        {
            $group: {
                _id: {
                    relationedID: '$relationedID',
                    relationedName: '$relationedName',
                    type: '$type',
                    action: '$action'
                },
                lastDate: { $max: '$createdOn' }
            }
        },
        { $sort: { lastDate: -1 } },
        { $limit: 10 },
    ];

    Statistic.aggregate(pipeline).then(docs => {
        const items = docs.map(doc => Object.assign({}, doc._id, {
            lastDate: doc.lastDate,
        }));
        res.json({ items: items });
    });
}

function getMostExecuted (req, res) {
    const conditions = { action: 'execute' };
    if (!req.user.isAdmin()) {
        conditions.userID = req.user.id;
    }

    const pipeline = [
        { $match: conditions },
        {
            $group: {
                _id: {
                    relationedID: '$relationedID',
                    relationedName: '$relationedName',
                    type: '$type',
                    action: '$action'
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
    ];

    Statistic.aggregate(pipeline).then(docs => {
        const items = docs.map(doc => Object.assign({}, doc._id, {
            count: doc.count,
        }));
        res.json({ items: items });
    });
}

module.exports = router;
