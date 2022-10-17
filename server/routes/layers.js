const express = require('express');
const mongoose = require('mongoose');
const url = require('../helpers/url.js');

const Layer = mongoose.model('Layer');

const router = express.Router();
router.get('/', function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive() || !req.user.isAdmin()) {
        return res.redirect(url('/login'));
    }

    res.render('layer/list');
});

router.get('/:layerId', async function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive() || !req.user.isAdmin()) {
        return res.redirect(url('/login'));
    }

    try {
        const layer = await Layer.findById(req.params.layerId);
        if (!layer) {
            return res.sendStatus(404);
        }
        res.render('layer/edit', { layer: layer.toObject({ getters: true }) });
    } catch (err) {
        console.error(err.message);
        return res.sendStatus(404);
    }
});

module.exports = router;
