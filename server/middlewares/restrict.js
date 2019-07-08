module.exports = function restrict (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        return res.sendStatus(403);
    }
};
