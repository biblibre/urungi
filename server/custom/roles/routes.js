const restrict = require('../../middlewares/restrict');
const restrictAdmin = require('../../middlewares/restrict-admin');

module.exports = function (app) {
    var Roles = require('./controller.js');

    /* roles */
    app.get('/api/roles/find-all', restrict, Roles.RolesFindAll);
    app.get('/api/roles/find-one', restrict, Roles.RolesFindOne);
    app.post('/api/roles/create', restrictAdmin, Roles.RolesCreate);
    app.post('/api/roles/update/:id', restrictAdmin, Roles.RolesUpdate);
    app.post('/api/roles/delete/:id', restrictAdmin, Roles.RolesDelete);
    app.get('/api/roles/get-roles', restrict, Roles.GetRoles);
};
