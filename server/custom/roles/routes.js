module.exports = function (app) {
    var Roles = require('./controller.js');

    /* roles */
    app.get('/api/roles/find-all', restrict, Roles.RolesFindAll);
    app.get('/api/roles/find-one', restrict, Roles.RolesFindOne);
    app.post('/api/roles/create', restrictRole(['WSTADMIN']), Roles.RolesCreate);
    app.post('/api/roles/update/:id', restrictRole(['WSTADMIN']), Roles.RolesUpdate);
    app.post('/api/roles/delete/:id', restrictRole(['WSTADMIN']), Roles.RolesDelete);
    app.get('/api/roles/get-roles', restrict, Roles.GetRoles);
};
