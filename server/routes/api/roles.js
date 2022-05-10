const express = require('express');
const mongoose = require('mongoose');
const restrict = require('../../middlewares/restrict.js');
const restrictAdmin = require('../../middlewares/restrict-admin.js');
const mongooseHelper = require('../../helpers/mongoose.js');

const router = express.Router();
const Role = mongoose.model('Role');
const User = mongoose.model('User');

router.param('roleId', function (req, res, next, roleId) {
    Role.findById(roleId).then(role => {
        if (role) {
            req.$role = role;
            next();
        } else {
            res.sendStatus(404);
        }
    }, err => {
        console.error(err.message);
        res.sendStatus(404);
    });
});

router.get('/', restrict, listRoles);
router.post('/', restrictAdmin, createRole);
router.get('/:roleId', restrict, getRole);
router.patch('/:roleId', restrictAdmin, updateRole);
router.delete('/:roleId', restrictAdmin, deleteRole);

function listRoles (req, res, next) {
    const pipeline = mongooseHelper.getAggregationPipelineFromQuery(req.query);
    Role.aggregate(pipeline).then(([result]) => {
        res.json(result);
    }).catch(next);
}

function createRole (req, res) {
    const role = new Role(req.body);
    role.companyID = 'COMPID';

    role.save().then(role => {
        res.status(201).json(role);
    }, err => {
        res.status(500).json({ error: err.message });
    });
}

function getRole (req, res) {
    res.json(req.$role);
}

function updateRole (req, res) {
    req.$role.set(req.body);
    req.$role.save().then(role => {
        res.json(role);
    }, err => {
        res.status(500).json({ error: err.message });
    });
}

async function deleteRole (req, res, next) {
    try {
        const targetRole = await Role.findById(req.params.roleId);
        if (targetRole) {
            await User.updateMany(
                { },
                { $pull: { roles: targetRole.id } }
            );
            await req.$role.remove();
            res.sendStatus(204);
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        next(err);
    }
}

module.exports = router;
