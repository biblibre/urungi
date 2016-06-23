var Pages = connection.model('Pages');


require('../../core/controller.js');

function PagesController(model) {
    this.model = model;
    this.searchFields = [];
}

PagesController.inherits(Controller);

var controller = new PagesController(Pages);

exports.PagesFindAll = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;
    req.query.fields = ['pageName'];
    var isWSTADMIN = false;
    if(req.isAuthenticated()){
        for (var i in req.user.roles) {
            if (req.user.roles[i] == 'WSTADMIN'){
                isWSTADMIN = true;
            }
        }
    }


    var perPage = config.pagination.itemsPerPage, page = (req.query.page) ? req.query.page : 1;
    var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"},{owner: req.user._id}]}
    var fields = {pageName:1,owner:1,isPublic:1};
    var params = {};

    var Pages = connection.model('Pages');
    Pages.find(find, fields, params, function(err, items){
        if(err) throw err;
        Pages.count(find, function (err, count) {
            var result = {result: 1, page: page, pages: ((req.query.page) ? Math.ceil(count/perPage) : 1), items: items};
            serverResponse(req, res, 200, result);
        });
    });
};

exports.PagesFindOne = function(req,res){

    //TODO: Are you granted to execute this page???

    req.query.trash = true;
    req.query.companyid = true;

    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.PagesCreate = function(req,res){
    if (!req.session.pagesCreate && !req.session.isWSTADMIN)
    {
        serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to create Pages"});
    } else {

    req.query.trash = true;
    req.query.companyid = true;
    req.query.userid = true;

    req.body.owner = req.user._id;
    req.body.isPublic = false;
    controller.create(req, function(result){
        serverResponse(req, res, 200, result);
    });
    }
};

exports.PagesDuplicate = function(req,res){
    if (!req.session.pagesCreate && !req.session.isWSTADMIN)
    {
        serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to create Pages"});
    } else {
        req.query.trash = true;
        req.query.companyid = true;
        req.query.userid = true;

        delete(req.body._id);
        req.body.pageName = 'Copy of '+req.body.pageName;
        req.body.owner = req.user._id;
        req.body.isPublic = false;
        controller.create(req, function(result){
            serverResponse(req, res, 200, result);
        });
    }
};

exports.PagesUpdate = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;

    var data = req.body;

    if (!req.session.isWSTADMIN)
    {
        var Pages = connection.model('Pages');
        Pages.findOne({_id:data._id,owner:req.user._id}, {_id:1}, {}, function(err, item){
            if(err) throw err;
            if (item) {
                controller.update(req, function(result){
                    serverResponse(req, res, 200, result);
                })
            } else {
                serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to update this page"});
            }

        });

    } else {
        controller.update(req, function(result){
            serverResponse(req, res, 200, result);
        })
    }


};

exports.PagesDelete = function(req,res){
    var data = req.body;

    req.query.trash = true;
    req.query.companyid = true;

    data._id = data.id;
    data.nd_trash_deleted = true;
    data.nd_trash_deleted_date = new Date();

    req.body = data;

    if (!req.session.isWSTADMIN)
    {
        var Pages = connection.model('Pages');
        Pages.findOne({_id:data._id,owner:req.user._id}, {_id:1}, {}, function(err, item){
            if(err) throw err;
            if (item) {
                controller.update(req, function(result){
                    serverResponse(req, res, 200, result);
                })
            } else {
                serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to delete this page"});
            }
        });

    } else {
        controller.update(req, function(result){
            serverResponse(req, res, 200, result);
        })
    }
};

exports.getPage = function(req,res)
{
    req.query.trash = true;
    var theReports = [];

    //TODO: permissions to execute

    controller.findOne(req, function(result){
        //identify reports of the page...

        if (result)
        {
            //Annotate the execution in statistics

            var statistics = connection.model('statistics');
            var stat = {};
            stat.type = 'page';
            stat.relationedID = result.item._id;
            stat.relationedName = result.item.pageName;
            stat.action = 'execute';
            statistics.save(req, stat, function() {

            });


            for (var r in result.item.items) {
                if (result.item.items[r].itemType == 'reportBlock')
                    {
                        theReports.push(result.item.items[r].reportID);
                    }
                    if (result.item.items[r].itemType == 'tabBlock')
                    {
                        //$scope.getTabBlock(result.item.items[r]);
                    }
            }



        //Get all the reports...
        var Reports = connection.model('Reports');

        Reports.find({ _id: {$in: theReports} }, function (err, reports) {

            if (reports) {
                for (var r in reports) {
                    for (var i in result.item.items) {
                        if (reports[r]._id == result.item.items[i].reportID)
                        {
                            result.item.items[i].reportDefinition = reports[r];
                        }
                    }
                }

                serverResponse(req, res, 200, result);

            }  else {
                //TODO: NO REPORTS FOUND
            }
        });

        } else {
            //TODO: NO DASHBOARD FOUND
        }
    });
}

exports.PublishPage = function(req,res)
{
    var data = req.body;
    var parentFolder = data.parentFolder;

    //tiene el usuario conectado permisos para publicar?
    var Pages = connection.model('Pages');
    var find = {_id:data._id,owner:req.user._id,companyID:req.user.companyID};

    if (req.session.isWSTADMIN)
        find = {_id:data._id,companyID:req.user.companyID};


    Pages.findOne(find, {}, {}, function(err, Page){
        if(err) throw err;
        if (Page) {
            Page.parentFolder = parentFolder;
            Page.isPublic = true;


            Pages.update({_id:data._id}, {$set: Page.toObject() }, function (err, numAffected) {
                if(err) throw err;

                if (numAffected>0)
                {
                    serverResponse(req, res, 200, {result: 1, msg: numAffected+" page published."});
                } else {
                    serverResponse(req, res, 200, {result: 0, msg: "Error publishing page, no page have been published"});
                }
            });
        } else {
            serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to publish this page, or this page do not exists"});
        }

    });

}

exports.UnpublishPage = function(req,res)
{
    var data = req.body;

    //TODO:tiene el usuario conectado permisos para publicar?
    var Pages = connection.model('Pages');
    var find = {_id:data._id,owner:req.user._id,companyID:req.user.companyID};

    if (req.session.isWSTADMIN)
        find = {_id:data._id,companyID:req.user.companyID};

    Pages.findOne(find, {}, {}, function(err, Page){
        if(err) throw err;
        if (Page) {
            Page.isPublic = false;
            Pages.update({_id:data._id}, {$set: Page.toObject() }, function (err, numAffected) {
                if(err) throw err;

                if (numAffected>0)
                {
                    serverResponse(req, res, 200, {result: 1, msg: numAffected+" page unpublished."});
                } else {
                    serverResponse(req, res, 200, {result: 0, msg: "Error unpublishing page, no page have been unpublished"});
                }
            });
        } else {
            serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to unpublish this page, or this page do not exists"});
        }

    });

}










