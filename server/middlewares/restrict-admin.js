module.exports = function restrictAdmin (req, res, next) {
    if (req.isAuthenticated() && req.user.roles.includes('ADMIN')) {
        next();
    } else {
        res.sendStatus(403);
    }
};
