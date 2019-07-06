/* GLOBAL FUNCTIONS */
const path = require('path');

var appRoot = path.join(__dirname, '..');
global.appRoot = appRoot;

function restrict (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.session.error = 'Access denied!';
        return res.status(403).send('Access denied');
    }
}
global.restrict = restrict;
