const express = require('express');
const mongoose = require('mongoose');
const url = require('../helpers/url.js');
const redirectToLogin = require('../middlewares/redirect-to-login.js');

const Layer = mongoose.model('Layer');

const router = express.Router();
router.get('/', redirectToLogin, onlyAdmin, function (req, res) {
    res.render('layer/list');
});

router.get('/:layerId', redirectToLogin, onlyAdmin, async function (req, res) {
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

function onlyAdmin (req, res, next) {
    if (!req.user.isAdmin()) {
        return res.redirect(url('/login'));
    }
    next();
}

module.exports = router;
