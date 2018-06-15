var Layers = connection.model('Layers');
const Controller = require('../../core/controller.js');

class LayersController extends Controller {
    constructor () {
        super(Layers);
        this.searchFields = ['actionCategory'];
    }
}

var controller = new LayersController();

exports.LayersCreate = function (req, res) {
    req.query.trash = true;

    req.user = {};
    req.user.companyID = 'COMPID';
    req.query.companyid = true;
    req.body.companyID = 'COMPID';

    controller.create(req, function (result) {
        serverResponse(req, res, 200, result);
    });
};

exports.LayersUpdate = function (req, res) {
    controller.update(req, function (result) {
        serverResponse(req, res, 200, result);
    });
};

exports.LayersFindAll = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';
    controller.findAll(req, function (result) {
        serverResponse(req, res, 200, result);
    });
};

exports.GetLayers = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    req.query.fields = ['name', 'description', 'objects', 'params.joins'];
    req.query.find = [];
    req.query.find.push({status: 'active'});

    controller.findAll(req, function (result) {
        serverResponse(req, res, 200, result);
    });
};

exports.LayersFindOne = function (req, res) {
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findOne(req, function (result) {
        serverResponse(req, res, 200, result);
    });
};

exports.changeLayerStatus = function (req, res) {
    Layers.setStatus(req, function (result) {
        serverResponse(req, res, 200, result);
    });
};
