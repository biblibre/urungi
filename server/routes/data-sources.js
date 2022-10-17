const express = require('express');
const mongoose = require('mongoose');
const url = require('../helpers/url.js');
const gettext = require('../config/gettext.js');

const Datasource = mongoose.model('Datasource');

const router = express.Router();
router.get('/', function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive() || !req.user.isAdmin()) {
        return res.redirect(url('/login'));
    }

    res.render('datasource/list');
});

router.get('/:datasourceId', async function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive() || !req.user.isAdmin()) {
        return res.redirect(url('/login'));
    }

    try {
        let datasource;
        if (req.params.datasourceId === 'new') {
            datasource = { name: gettext.gettext('New datasource'), id: 'new' };
        } else {
            datasource = await Datasource.findById(req.params.datasourceId);
            if (!datasource) {
                return res.sendStatus(404);
            }
        }
        res.render('datasource/edit', { datasource: datasource.toObject({ getters: true }) });
    } catch (err) {
        console.error(err.message);
        return res.sendStatus(404);
    }
});

module.exports = router;
