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
    //req.query.companyid = true;

    req.query.fields = ['dashboardName'];

    controller.findAll(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.DashboardsFindOne = function(req,res){
    req.query.trash = true;

    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.DashboardsCreate = function(req,res){
    req.query.trash = true;
    //req.query.companyid = true;

    console.log(req.body);

    controller.create(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.DashboardsUpdate = function(req,res){
    req.query.trash = true;
    //req.query.companyid = true;

    controller.update(req, function(result){
        serverResponse(req, res, 200, result);
    })
};

exports.DashboardsDelete = function(req,res){
    var data = req.body;

    req.query.trash = true;
    req.query.companyid = true;

    data._id = data.id;
    data.nd_trash_deleted = true;
    data.nd_trash_deleted_date = new Date();

    req.body = data;

    controller.update(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.getDashboard = function(req,res)
{
    req.query.trash = true;
    var theReports = [];

    controller.findOne(req, function(result){
        //identify reports of the dashboard...

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
                //NO REPORTS FOUND
            }
        });


    });
}










