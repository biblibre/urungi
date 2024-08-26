module.exports = function flash (req, res, next) {
    req.session.flash = req.session.flash || [];

    // This function is named 'flash' so that we can use PassportJS's
    // `failureFlash` option
    req.flash = function (type, text) {
        if (arguments.length === 0) {
            return req.session.flash.splice(0);
        }

        req.session.flash.push({ type, text });
    };

    next();
};
