const pikitia = require('../helpers/pikitia');

module.exports = function assertPikitiaIsConfigured (req, res, next) {
    if (!pikitia.isConfigured()) {
        return res.sendStatus(501);
    }

    next();
};
