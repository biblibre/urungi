var Roles = connection.model('Roles');
const Controller = require('../../core/controller.js');

class RolesController extends Controller {
    constructor () {
        super(Roles);
        this.searchFields = ['actionCategory'];
    }
}

var controller = new RolesController();

exports.RolesCreate = function (req, res) {
    req.query.trash = true;
    req.user = {};
    req.user.companyID = 'COMPID';
    req.query.companyid = true;
    req.body.companyID = 'COMPID';
    controller.create(req, function (result) {
        res.status(200).json(result);
    });
};

exports.RolesUpdate = function (req, res) {
    // req.query.trash = true;
    // req.query.companyid = true;

    controller.update(req, function (result) {
        res.status(200).json(result);
    });
};

exports.RolesFindAll = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findAll(req, function (result) {
        res.status(200).json(result);
    });
};

exports.GetRoles = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    req.query.fields = ['name', 'description', 'permissions'];

    controller.findAll(req, function (result) {
        res.status(200).json(result);
    });
};

exports.RolesFindOne = function (req, res) {
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findOne(req, function (result) {
        res.status(200).json(result);
    });
};

exports.RolesDelete = function (req, res) {
    var data = req.body;

    req.query.trash = true;
    req.query.companyid = true;

    data._id = data.id;
    data.nd_trash_deleted = true;
    data.nd_trash_deleted_date = new Date();

    req.body = data;

    controller.update(req, function (result) {
        res.status(200).json(result);
    });
};
