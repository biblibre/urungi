const express = require('express');
const mongoose = require('mongoose');
const url = require('../helpers/url.js');
const redirectToLogin = require('../middlewares/redirect-to-login.js');
const gettext = require('../config/gettext.js');

const Datasource = mongoose.model('Datasource');

const router = express.Router();

router.param('datasourceId', function (req, res, next, datasourceId) {
    Datasource.findById(datasourceId).then(datasource => {
        if (datasource) {
            req.$datasource = datasource;
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
    res.render('datasource/list');
});

router.get('/new', redirectToLogin, onlyAdmin, datasourceNew);
router.post('/new', redirectToLogin, onlyAdmin, validateForm, datasourceNew);
router.get('/:datasourceId/edit', redirectToLogin, onlyAdmin, datasourceEdit);
router.post('/:datasourceId/edit', redirectToLogin, onlyAdmin, validateForm, datasourceEdit);

async function datasourceNew (req, res) {
    let formData;
    if (req.method === 'POST') {
        formData = Object.assign({}, req.body);
        if (res.formErrors.length === 0) {
            const datasourceData = Object.assign({}, formData);
            await Datasource.create(datasourceData);

            req.flash('success', gettext.gettext('Datasource created successfully'));
            return res.redirect(url('/data-sources'));
        } else {
            for (const error of res.formErrors) {
                req.flash('error', error);
            }
        }
    }

    const scope = {
        csrf: req.csrfToken(),
        formData,
    };
    res.render('datasource/new', scope);
}

async function datasourceEdit (req, res) {
    let formData;
    if (req.method === 'POST') {
        formData = Object.assign({}, req.body);
        if (res.formErrors.length === 0) {
            const datasourceData = Object.assign({}, formData);
            req.$datasource.set(datasourceData);
            await req.$datasource.save();

            req.flash('success', gettext.gettext('Datasource updated successfully'));
            return res.redirect(url('/data-sources'));
        } else {
            for (const error of res.formErrors) {
                req.flash('error', error);
            }
        }
    } else {
        formData = req.$datasource.toObject({ getters: true });
    }

    const scope = {
        csrf: req.csrfToken(),
        formData,
    };
    res.render('datasource/edit', scope);
}

function validateForm (req, res, next) {
    res.formErrors = [];
    if (!req.body.name) {
        res.formErrors.push(gettext.gettext('Name is required'));
    }
    if (!req.body.type) {
        res.formErrors.push(gettext.gettext('Type is required'));
    }
    next();
}

function onlyAdmin (req, res, next) {
    if (!req.user.isAdmin()) {
        return res.redirect(url('/'));
    }
    next();
}

module.exports = router;
