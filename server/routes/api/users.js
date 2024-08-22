const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const restrictAdmin = require('../../middlewares/restrict-admin');
const mongooseHelper = require('../../helpers/mongoose');
const { sendEmailTemplate } = require('../../helpers/mailer');

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
router.get('/:userId/reports', canViewUser, getUserReports);
router.get('/:userId/dashboards', canViewUser, getUserDashboards);
router.get('/:userId/counts', canViewUser, getUserCounts);
router.put('/:userId/roles/:roleId', restrictAdmin, setUserRole);
router.delete('/:userId/roles/:roleId', restrictAdmin, unsetUserRole);
router.delete('/:userId', restrictAdmin, deleteUser);

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
    const user = new User(req.body);
    user.createdBy = req.user._id;
    user.companyID = 'COMPID';

    let userPassword;
    if (req.body.sendPassword) {
        const generatePassword = require('password-generator');
        userPassword = generatePassword();
        user.password = userPassword;
    }

    try {
        await user.save();

        if (req.body.sendPassword) {
            const recipient = {
                userName: user.userName,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userPassword: userPassword,
            };

            await sendEmailTemplate('newUserAndPassword', [recipient], 'email', 'Welcome to Urungi');
        }

        res.status(201).json(user.toObject());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

function getUser (req, res, next) {
    res.json(req.$user);
}

function updateUser (req, res) {
    req.$user.set(req.body);
    req.$user.save().then(user => {
        res.json(user.toObject());
    }, err => {
        res.status(500).json({ error: err.message });
    });
}

function getUserReports (req, res) {
    req.$user.getReports().then(reports => {
        res.json({ items: reports });
    });
}

function getUserDashboards (req, res) {
    req.$user.getDashboards().then(dashboards => {
        res.json({ items: dashboards });
    });
}

function getUserCounts (req, res) {
    const promises = [
        req.$user.getReports().where('isShared', true).countDocuments(),
        req.$user.getReports().where('isShared', false).countDocuments(),
        req.$user.getDashboards().where('isShared', true).countDocuments(),
        req.$user.getDashboards().where('isShared', false).countDocuments(),
    ];

    Promise.all(promises).then(counts => {
        const [sharedReports, privateReports, sharedDashboards, privateDashboards] = counts;

        res.json({ sharedReports, privateReports, sharedDashboards, privateDashboards });
    });
}

function setUserRole (req, res) {
    const user = req.$user;
    const roleId = req.params.roleId;

    user.roles = user.roles.filter(r => r !== roleId);
    user.roles.push(roleId);

    user.save().then(() => {
        res.sendStatus(204);
    }, err => {
        res.status(500).json({ error: err.message });
    });
}

function unsetUserRole (req, res) {
    const user = req.$user;
    const roleId = req.params.roleId;

    user.roles = user.roles.filter(r => r !== roleId);
    user.save().then(() => {
        res.sendStatus(204);
    }, err => {
        res.status(500).json({ error: err.message });
    });
}

async function deleteUser (req, res, next) {
    try {
        await req.$user.deleteOne();
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
}

module.exports = router;
