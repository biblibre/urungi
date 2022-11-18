const express = require('express');
const url = require('../helpers/url.js');

const router = express.Router();
router.get('/', function (req, res) {
    if (!req.isAuthenticated() || !req.user.isActive() || !req.user.isAdmin()) {
        return res.redirect(url('/login'));
    }

    res.render('role/list');
});

module.exports = router;
