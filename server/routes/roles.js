const express = require('express');
const mongoose = require('mongoose');
const gettext = require('../config/gettext.js');
const url = require('../helpers/url.js');

const Company = mongoose.model('Company');
const Role = mongoose.model('Role');
const User = mongoose.model('User');

const router = express.Router();

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

router.get('/', onlyAdmin, function (req, res) {
    res.render('role/list');
});

router.get('/new', onlyAdmin, roleNew);
router.post('/new', onlyAdmin, validateForm, roleNew);
router.get('/:roleId/edit', onlyAdmin, roleEdit);
router.post('/:roleId/edit', onlyAdmin, validateForm, roleEdit);

router.get('/:roleId/delete', onlyAdmin, async function (req, res) {
    const usersCount = await User.countDocuments({ roles: req.$role.id });
    const scope = {
        csrf: req.csrfToken(),
        role: req.$role.toObject({ getters: true }),
        usersCount,
    };
    res.render('role/delete', scope);
});

router.post('/:roleId/delete', onlyAdmin, async function (req, res) {
    await req.$role.deleteOne();

    req.flash('success', gettext.gettext('Role deleted successfully'));
    res.redirect(url('/roles'));
});

function roleDataFromFormData (formData) {
    const { name, description } = formData;
    const { reportsCreate, dashboardsCreate, exploreData, viewSQL, grantsMap } = formData;

    const grants = [];
    for (const folderId in grantsMap) {
        const grant = {
            folderID: folderId,
            shareReports: !!grantsMap[folderId].shareReports,
            executeReports: !!grantsMap[folderId].executeReports,
            executeDashboards: !!grantsMap[folderId].executeDashboards,
        };
        grants.push(grant);
    }

    const roleData = {
        name,
        description,
        reportsCreate,
        dashboardsCreate,
        exploreData,
        viewSQL,
        grants,
    };

    return roleData;
}

async function roleNew (req, res) {
    let formData;
    if (req.method === 'POST') {
        formData = Object.assign({}, req.body);
        if (res.formErrors.length === 0) {
            const roleData = roleDataFromFormData(formData);
            await Role.create(roleData);

            req.flash('success', gettext.gettext('Role created successfully'));
            return res.redirect(url('/roles'));
        } else {
            for (const error of res.formErrors) {
                req.flash('error', error);
            }
        }
    }

    const { sharedSpace } = await Company.findOne({ companyID: 'COMPID' });

    const scope = {
        csrf: req.csrfToken(),
        formData,
        sharedSpace,
    };
    res.render('role/new', scope);
}

async function roleEdit (req, res) {
    let formData;
    if (req.method === 'POST') {
        formData = Object.assign({}, req.body);
        if (res.formErrors.length === 0) {
            const roleData = roleDataFromFormData(formData);
            req.$role.set(roleData);
            await req.$role.save();

            req.flash('success', gettext.gettext('Role updated successfully'));
            return res.redirect(url('/roles'));
        } else {
            for (const error of res.formErrors) {
                req.flash('error', error);
            }
        }
    } else {
        formData = req.$role.toObject({ getters: true });

        const grantsMap = {};
        for (const grant of req.$role.grants) {
            const { shareReports, executeReports, executeDashboards } = grant;
            grantsMap[grant.folderID] = { shareReports, executeReports, executeDashboards };
        }
        formData.grantsMap = grantsMap;
        delete formData.grants;
    }

    const { sharedSpace } = await Company.findOne({ companyID: 'COMPID' });

    const scope = {
        csrf: req.csrfToken(),
        formData,
        sharedSpace,
    };
    res.render('role/edit', scope);
}

function validateForm (req, res, next) {
    res.formErrors = [];
    if (!req.body.name) {
        res.formErrors.push(gettext.gettext('Name is required'));
    }
    next();
}

function onlyAdmin (req, res, next) {
    if (!req.isAuthenticated() || !req.user.isActive()) {
        return res.redirect(url('/login'));
    }
    if (!req.user.isAdmin()) {
        return res.redirect(url('/'));
    }
    next();
}

module.exports = router;
