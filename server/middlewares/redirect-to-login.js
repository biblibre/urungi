const url = require('../helpers/url.js');

module.exports = function redirectToLogin (req, res, next) {
    if (!req.isAuthenticated() || !req.user.isActive()) {
        req.session.redirect_url = req.originalUrl;
        return res.redirect(url('/login'));
    }

    next();
};
