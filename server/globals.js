/* GLOBAL FUNCTIONS */
const path = require('path');
const debug = require('debug')('urungi:server');

var appRoot = path.join(__dirname, '..');
global.appRoot = appRoot;

function restrict (req, res, next) {
    if (global.authentication) {
        if (req.isAuthenticated()) {
            next();
        } else {
            req.session.error = 'Access denied!';
            return res.redirect(302, '/login');
        }
    } else {
        next();
    }
}
global.restrict = restrict;

function restrictRole (roles) {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            for (var i in roles) {
                if (req.user.roles.indexOf(roles[i]) > -1) {
                    next();
                    return;
                }
            }
        }
        req.session.error = 'Access denied!';
        // TODO: Log annotation security issue
        debug('Access denied!');
        res.status(401).send({result: 0, msg: 'You don´t have access to this function'});
    };
}
global.restrictRole = restrictRole;

function saveToLog (req, text, type, code, otherInfo, associatedID) {
    var Logs = connection.model('Logs');

    Logs.saveToLog(req, {text: text, type: type, code: code, associatedID: associatedID}, otherInfo, function () {

    });
};
global.saveToLog = saveToLog;
