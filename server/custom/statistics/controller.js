var Logs = connection.model('statistics');

/*
exports.statisticsSaveToLog = function(req,res){
    Logs.saveToLog(req, req.body, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.adminLogsFindAll = function(req,res){
    Logs.adminFindAll(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.addToCustomLog = function(user, relationCollection, relationID, action, text) {
    var log = {
        user_id: user._id,
        companyID: user.companyID,
        relationID: relationID,
        relationCollection: relationCollection,
        action: action
    };

    if (text) log['text'] = text;

    Logs.create(log, function(err, item) {
        console.log(item);
    });
};
*/