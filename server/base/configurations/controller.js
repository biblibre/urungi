//var Configurations = require('../models/configurations');
var Configurations = connection.model('Configurations');

/* CONFIGURATIONS */

exports.adminFindUserFilters = function(req,res){
    Configurations.adminFindUserFilters(function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.adminGetConfigurations = function(req,res){
    Configurations.adminGetConfigurations(function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.adminSaveConfigurations = function(req,res){
    Configurations.adminSaveConfigurations(req.body, function(result){
        serverResponse(req, res, 200, result);
    });
};