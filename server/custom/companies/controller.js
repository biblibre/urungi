var Companies = connection.model('Companies');

require('../../core/controller.js');

function CompaniesController(model) {
    this.model = model;
    this.searchFields = [];
}


exports.getCompanyData = function(req,res){
    var Companies = connection.model('Companies');
    Companies.findOne({companyID:req.user.companyID,nd_trash_deleted: false},{},function(err, company){
        serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: company});

    });
};

exports.savePublicSpace = function(req,res){
    var data = req.body;

    var Companies = connection.model('Companies');
    Companies.update({companyID:req.user.companyID}, {$set: {publicSpace: data} }, function (err, numAffected) {
        if(err) throw err;

        if (numAffected>0)
        {
            var result = {result: 1, msg: numAffected+" record updated."};
        } else {
            var result = {result: 0, msg: "Error updating record, no record have been updated"};
        }

        serverResponse(req, res, 200, result);
    });
}


exports.saveCustomCSS = function(req,res){
    var data = req.body.customCSS;

    var Companies = connection.model('Companies');
    Companies.update({companyID:req.user.companyID}, {$set: {customCSS: data} }, function (err, numAffected) {
        if(err) throw err;

        if (numAffected>0)
        {
            var result = {result: 1, msg: numAffected+" record updated."};
        } else {
            var result = {result: 0, msg: "Error updating record, no record have been updated"};
        }

        serverResponse(req, res, 200, result);
    });
}


exports.saveCustomLogo = function(req,res){
    var data = req.body;

    var Companies = connection.model('Companies');
    Companies.update({companyID:req.user.companyID}, {$set: {customLogo: data} }, function (err, numAffected) {
        if(err) throw err;

        if (numAffected>0)
        {
            var result = {result: 1, msg: numAffected+" record updated."};
        } else {
            var result = {result: 0, msg: "Error updating record, no record have been updated"};
        }

        serverResponse(req, res, 200, result);
    });
}

CompaniesController.inherits(Controller);

var controller = new CompaniesController(Companies);



