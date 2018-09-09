var Logs = connection.model('Logs');

/* LOGS */
exports.logsSaveToLog = function (req, res) {
    Logs.saveToLog(req, req.body, '', function (result) {
        res.status(200).json(result);
    });
};

exports.adminLogsFindAll = function (req, res) {
    Logs.adminFindAll(req, function (result) {
        res.status(200).json(result);
    });
};

exports.addToCustomLog = function (user, relationCollection, relationID, action, text) {
    var log = {
        user_id: user._id,
        companyID: user.companyID,
        relationID: relationID,
        relationCollection: relationCollection,
        action: action
    };

    if (text) log['text'] = text;

    Logs.create(log, function (err, item) {
        if (err) { console.error(err); }
        // console.log(item);
    });
};
