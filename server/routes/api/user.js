const express = require('express');
const mongoose = require('mongoose');
const restrict = require('../../middlewares/restrict');

const User = mongoose.model('User');
const Datasource = mongoose.model('Datasource');
const Role = mongoose.model('Role');
const Layer = mongoose.model('Layer');

const router = express.Router();

router.use(restrict);

router.get('/', getUser);
router.put('/password', updateUserPassword);
router.get('/counts', getCounts);
router.get('/objects', getObjects);
router.put('/context-help/:name', setContextHelp);

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
    res.json({ items: await req.user.getObjects() });
}

function setContextHelp (req, res) {
    const update = { $addToSet: { contextHelp: req.params.name } };
    User.findByIdAndUpdate(req.user._id, update, { new: true }).then(user => {
        res.json({ items: user.contextHelp });
    }, err => {
        res.status(500).json({ error: err.message });
    });
}

module.exports = router;
