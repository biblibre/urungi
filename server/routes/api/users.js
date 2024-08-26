const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const restrictAdmin = require('../../middlewares/restrict-admin');
const mongooseHelper = require('../../helpers/mongoose');
const userHelper = require('../../helpers/user.js');
const gettext = require('../../config/gettext.js');

const router = express.Router();

router.param('userId', function (req, res, next, userId) {
    User.findById(userId).then(user => {
        if (user) {
            req.$user = user;
            next();
        } else {
            res.sendStatus(404);
        }
    }, err => {
        console.error(err.message);
        res.sendStatus(404);
    });
});

router.get('/', restrictAdmin, listUsers);
router.post('/', restrictAdmin, createUser);
router.get('/:userId', canViewUser, getUser);
router.patch('/:userId', restrictAdmin, updateUser);

function canViewUser (req, res, next) {
    if (req.isAuthenticated() && (req.user.isAdmin() || req.user.id === req.$user.id)) {
        next();
    } else {
        res.sendStatus(403);
    }
}

function listUsers (req, res, next) {
    const pipeline = mongooseHelper.getAggregationPipelineFromQuery(req.query);
    User.aggregate(pipeline).then(([result]) => {
        res.json(result);
    }).catch(next);
}

async function createUser (req, res) {
    const { sendPassword, ...data } = req.body;
    data.createdBy = req.user._id;

    try {
        const user = await userHelper.createUser(data, { sendPassword });

        res.status(201).json(user.toObject());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

function getUser (req, res, next) {
    res.json(req.$user);
}

function updateUser (req, res) {
    if (req.$user.id === req.user.id && req.body.status) {
        return res.status(400).json({ error: gettext.gettext('Impossible to modify own status') });
    }
    req.$user.set(req.body);
    req.$user.save().then(user => {
        res.json(user.toObject());
    }, err => {
        res.status(500).json({ error: err.message });
    });
}

module.exports = router;
