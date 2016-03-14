var Layers = connection.model('Layers');
require('../../core/controller.js');
function LayersController(model) {
    this.model = model;
    this.searchFields = ['actionCategory'];
}
LayersController.inherits(Controller);
var controller = new LayersController(Layers);



exports.LayersCreate = function(req,res){
    console.log('creating layer');
    req.query.trash = true;

    req.user = {};
    req.user.companyID = 'COMPID';
    req.query.companyid = true;
    req.body.companyID = 'COMPID';

    //console.log(req.body);

    controller.create(req, function(result){
        serverResponse(req, res, 200, result);
    });
};
//Pat - 07770966919

exports.LayersUpdate = function(req,res){
    //req.query.trash = true;
    //req.query.companyid = true;

    controller.update(req, function(result){
        serverResponse(req, res, 200, result);
    });
};


exports.LayersFindAll = function(req,res)
{
    console.log('finding all layers');
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findAll(req, function(result){
        serverResponse(req, res, 200, result);
        console.log('getting all layers');
    });
}

exports.GetLayers = function(req,res)
{
    console.log('getting all layers');
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    req.query.fields = ['name','description','objects','params.joins'];
    req.query.find = [];
    req.query.find.push({status:'active'});

    controller.findAll(req, function(result){
        serverResponse(req, res, 200, result);
    });
}

exports.LayersFindOne = function(req,res){

    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
};


exports.LayersDelete = function(req,res){
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

exports.changeLayerStatus = function(req,res){

    Layers.setStatus(req,function(result){
        serverResponse(req, res, 200, result);
    });

}


