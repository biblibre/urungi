module.exports = function restrictAdmin (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin()) {
        next();
    } else {
        res.sendStatus(403);
    }
};
