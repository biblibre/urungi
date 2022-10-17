const express = require('express');
const mongoose = require('mongoose');
const url = require('../helpers/url.js');

const User = mongoose.model('User');

const router = express.Router();
router.get('/', function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive() || !req.user.isAdmin()) {
        return res.redirect(url('/login'));
    }

    res.render('user/list');
});

router.get('/:userId', async function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive() || !req.user.isAdmin()) {
        return res.redirect(url('/login'));
    }

    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.sendStatus(404);
        }
        res.render('user/show', { selectedUser: user.toObject({ getters: true }) });
    } catch (err) {
        console.error(err.message);
        return res.sendStatus(404);
    }
});

module.exports = router;
