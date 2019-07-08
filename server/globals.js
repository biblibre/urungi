/* GLOBAL FUNCTIONS */

function restrict (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.session.error = 'Access denied!';
        return res.status(403).send('Access denied');
    }
}
global.restrict = restrict;
