module.exports = function restrict (req, res, next) {
    if (req.isAuthenticated() && req.user.isActive()) {
        next();
    } else {
        return res.sendStatus(403);
    }
};
