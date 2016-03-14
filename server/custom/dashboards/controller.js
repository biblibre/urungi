var Dashboards = connection.model('Dashboards');



require('../../core/controller.js');

function DashboardsController(model) {
    this.model = model;
    this.searchFields = [];
}

DashboardsController.inherits(Controller);

var controller = new DashboardsController(Dashboards);

exports.DashboardsFindAll = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;

    req.query.fields = ['dashboardName'];

    var isWSTADMIN = false;

    if(req.isAuthenticated()){
        for (var i in req.user.roles) {
            if (req.user.roles[i] == 'WSTADMIN'){
                isWSTADMIN = true;
            }
        }
    }


    var perPage = config.pagination.itemsPerPage, page = (req.query.page) ? req.query.page : 1;
    /*
     if (isWSTADMIN)
     var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"}]}
     else */
    var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"},{owner: req.user._id}]}
    //var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"},{"$or": [{owner: req.user._id},{owner: { $exists: false }}]}]}
    var fields = {dashboardName:1,owner:1,isPublic:1};
    var params = {};

    var Dashboards = connection.model('Dashboards');
    Dashboards.find(find, fields, params, function(err, items){
        if(err) throw err;
        Dashboards.count(find, function (err, count) {
            var result = {result: 1, page: page, pages: ((req.query.page) ? Math.ceil(count/perPage) : 1), items: items};
            serverResponse(req, res, 200, result);
        });
    });
    /*
    controller.findAll(req, function(result){
        serverResponse(req, res, 200, result);
    });*/
};

exports.DashboardsFindOne = function(req,res){

    //TODO: Tienes permisos para ejecutar el dashboard

    req.query.trash = true;
    req.query.companyid = true;

    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.DashboardsCreate = function(req,res){
    if (!req.session.dashboardsCreate && !req.session.isWSTADMIN)
    {
        serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to create dashboards"});
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

exports.DashboardsUpdate = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;

    var data = req.body;

    if (!req.session.isWSTADMIN)
    {
        var Dashboards = connection.model('Dashboards');
        Dashboards.findOne({_id:data._id,owner:req.user._id}, {_id:1}, {}, function(err, item){
            if(err) throw err;
            if (item) {
                controller.update(req, function(result){
                    serverResponse(req, res, 200, result);
                })
            } else {
                serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to update this dashboard"});
            }

        });

    } else {
        controller.update(req, function(result){
            serverResponse(req, res, 200, result);
        })
    }


};

exports.DashboardsDelete = function(req,res){
    var data = req.body;

    req.query.trash = true;
    req.query.companyid = true;

    data._id = data.id;
    data.nd_trash_deleted = true;
    data.nd_trash_deleted_date = new Date();

    req.body = data;

    if (!req.session.isWSTADMIN)
    {
        var Dashboards = connection.model('Dashboards');
        Dashboards.findOne({_id:data._id,owner:req.user._id}, {_id:1}, {}, function(err, item){
            if(err) throw err;
            if (item) {
                controller.update(req, function(result){
                    serverResponse(req, res, 200, result);
                })
            } else {
                serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to delete this dashboard"});
            }
        });

    } else {
        controller.update(req, function(result){
            serverResponse(req, res, 200, result);
        })
    }
};

exports.getDashboard = function(req,res)
{
    req.query.trash = true;
    var theReports = [];

    //TODO: permissions to execute

    controller.findOne(req, function(result){
        //identify reports of the dashboard...

        if (result)
        {
            //Annotate the execution in statistics

            var statistics = connection.model('statistics');
            var stat = {};
            stat.type = 'dashboard';
            stat.relationedID = result.item._id;
            stat.relationedName = result.item.dashboardName;
            if (req.query.linked == true)
                stat.action = 'execute link';
                else
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

exports.PublishDashboard = function(req,res)
{
    var data = req.body;
    var parentFolder = data.parentFolder;

    //tiene el usuario conectado permisos para publicar?
    var Dashboards = connection.model('Dashboards');
    var find = {_id:data._id,owner:req.user._id,companyID:req.user.companyID};

    if (req.session.isWSTADMIN)
        find = {_id:data._id,companyID:req.user.companyID};


    Dashboards.findOne(find, {}, {}, function(err, Dashboard){
        if(err) throw err;
        if (Dashboard) {
            Dashboard.parentFolder = parentFolder;
            Dashboard.isPublic = true;


            Dashboards.update({_id:data._id}, {$set: Dashboard.toObject() }, function (err, numAffected) {
                if(err) throw err;

                if (numAffected>0)
                {
                    serverResponse(req, res, 200, {result: 1, msg: numAffected+" dashboard published."});
                } else {
                    serverResponse(req, res, 200, {result: 0, msg: "Error publishing dashboard, no dashboard have been published"});
                }
            });
        } else {
            serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to publish this dashboard, or this dashboard do not exists"});
        }

    });

}

exports.UnpublishDashboard = function(req,res)
{
    var data = req.body;

    //TODO:tiene el usuario conectado permisos para publicar?
    var Dashboards = connection.model('Dashboards');
    var find = {_id:data._id,owner:req.user._id,companyID:req.user.companyID};

    if (req.session.isWSTADMIN)
        find = {_id:data._id,companyID:req.user.companyID};

    Dashboards.findOne(find, {}, {}, function(err, Dashboard){
        if(err) throw err;
        if (Dashboard) {
            Dashboard.isPublic = false;
            Dashboards.update({_id:data._id}, {$set: Dashboard.toObject() }, function (err, numAffected) {
                if(err) throw err;

                if (numAffected>0)
                {
                    serverResponse(req, res, 200, {result: 1, msg: numAffected+" dashboard unpublished."});
                } else {
                    serverResponse(req, res, 200, {result: 0, msg: "Error unpublishing dashboard, no dashboard have been unpublished"});
                }
            });
        } else {
            serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to unpublish this dashboard, or this dashboard do not exists"});
        }

    });

}










