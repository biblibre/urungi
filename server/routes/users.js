const express = require('express');
const mongoose = require('mongoose');
const gettext = require('../config/gettext.js');
const url = require('../helpers/url.js');
const redirectToLogin = require('../middlewares/redirect-to-login.js');
const userHelper = require('../helpers/user.js');

const User = mongoose.model('User');
const Role = mongoose.model('Role');

const router = express.Router();

function onlyAdmin (req, res, next) {
    if (!req.user.isAdmin()) {
        return res.redirect(url('/'));
    }
    next();
}

function onlyAdminOrSelf (req, res, next) {
    if (!req.user.isAdmin() && req.user.id !== req.$user.id) {
        return res.redirect(url('/'));
    }
    next();
}

function onlySelf (req, res, next) {
    if (req.user.id !== req.$user.id) {
        return res.redirect(url('/'));
    }
    next();
}

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

router.get('/', redirectToLogin, onlyAdmin, function (req, res) {
    res.render('user/list');
});

function validateForm (req, res, next) {
    res.formErrors = [];
    if (!req.body.userName) {
        res.formErrors.push(gettext.gettext('Username is required'));
    }
    if (!req.body.firstName) {
        res.formErrors.push(gettext.gettext('First name is required'));
    }
    if (!req.body.lastName) {
        res.formErrors.push(gettext.gettext('Last name is required'));
    }
    if (!req.body.email) {
        res.formErrors.push(gettext.gettext('Email is required'));
    }
    if (req.$user) {
        if ((req.body.password || req.body.password2) && req.body.password !== req.body.password2) {
            res.formErrors.push(gettext.gettext('Passwords must match'));
        }
    } else {
        if (!req.body.sendPassword && !(req.body.password && req.body.password2)) {
            res.formErrors.push(gettext.gettext('Password is required'));
        }
        if (!req.body.sendPassword && req.body.password !== req.body.password2) {
            res.formErrors.push(gettext.gettext('Passwords must match'));
        }
    }
    next();
}

router.get('/new', redirectToLogin, onlyAdmin, userNew);
router.post('/new', redirectToLogin, onlyAdmin, validateForm, userNew);

async function userNew (req, res) {
    let formData;
    if (req.method === 'POST') {
        formData = Object.assign({}, req.body);
        if (res.formErrors.length === 0) {
            const { sendPassword, ...userData } = formData;
            userData.createdBy = req.user._id;
            const user = await userHelper.createUser(userData, { sendPassword });

            return res.redirect(url(`/users/${user.id}`));
        } else {
            for (const error of res.formErrors) {
                req.flash('error', error);
            }
        }
    }

    const scope = {
        csrf: req.csrfToken(),
        roles: await getRoles(),
        formData,
    };
    res.render('user/new', scope);
}

router.get('/:userId', redirectToLogin, onlyAdminOrSelf, async function (req, res) {
    const reportDocs = await req.$user.getReports();
    const dashboardDocs = await req.$user.getDashboards();
    const roles = await getRoles();
    const rolesMap = Object.fromEntries(roles.map(role => ([role.id, role.name])));
    const scope = {
        user: req.$user.toObject({ getters: true }),
        reports: reportDocs.map(doc => doc.toObject({ getters: true })),
        dashboards: dashboardDocs.map(doc => doc.toObject({ getters: true })),
        rolesMap,
    };
    res.render('user/show', scope);
});

router.get('/:userId/change-password', redirectToLogin, onlySelf, async function (req, res) {
    const scope = {
        csrf: req.csrfToken(),
        user: req.$user.toObject({ getters: true }),
    };
    res.render('user/change-password', scope);
});

router.post('/:userId/change-password', redirectToLogin, onlySelf, async function (req, res) {
    const formErrors = [];

    const currentPassword = req.body.currentPassword;
    const validUser = await new Promise((resolve, reject) => {
        User.isValidUserPassword(req.$user.userName, currentPassword, (err, user) => {
            if (err) {
                reject(err);
            } else {
                resolve(user);
            }
        });
    });

    if (!validUser) {
        formErrors.push(gettext.gettext('Current password is incorrect'));
    }

    if (req.body.newPassword !== req.body.repeatPassword) {
        formErrors.push(gettext.gettext('Passwords must match'));
    }

    if (formErrors.length > 0) {
        for (const error of formErrors) {
            req.flash('error', error);
        }
        const scope = {
            csrf: req.csrfToken(),
            user: req.$user.toObject({ getters: true }),
        };
        return res.render('user/change-password', scope);
    }

    req.$user.password = req.body.newPassword;
    await req.$user.save();

    req.flash('success', gettext.gettext('Password changed successfully'));
    res.redirect(url(`/users/${req.$user.id}`));
});

router.get('/:userId/edit', redirectToLogin, onlyAdmin, userEdit);
router.post('/:userId/edit', redirectToLogin, onlyAdmin, validateForm, userEdit);

async function userEdit (req, res) {
    let formData;
    if (req.method === 'POST') {
        formData = Object.assign({}, req.body);
        if (res.formErrors.length === 0) {
            const user = req.$user;
            user.set(formData);
            await user.save();

            return res.redirect(url(`/users/${user.id}`));
        } else {
            for (const error of res.formErrors) {
                req.flash('error', error);
            }
        }
    } else {
        formData = req.$user.toObject({ getters: true });
    }

    const scope = {
        csrf: req.csrfToken(),
        roles: await getRoles(),
        formData,
        user: req.$user.toObject({ getters: true }),
    };
    res.render('user/edit', scope);
}

router.get('/:userId/delete', redirectToLogin, onlyAdmin, function (req, res) {
    res.locals.csrf = req.csrfToken();
    res.render('user/delete', { user: req.$user.toObject({ getters: true }) });
});

router.post('/:userId/delete', redirectToLogin, onlyAdmin, async function (req, res) {
    await req.$user.deleteOne();

    req.flash('success', gettext.gettext('User deleted successfully'));
    res.redirect(url('/users'));
});

async function getRoles () {
    const roleDocs = await Role.find();
    const roles = roleDocs.map(doc => doc.toObject({ getters: true }));
    roles.unshift({ id: 'ADMIN', name: gettext.gettext('Urungi Administrator') });

    return roles;
}

module.exports = router;
