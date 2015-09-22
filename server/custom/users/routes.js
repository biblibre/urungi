module.exports = function (app) {
    var users = require('./controller.js');

    /* USERS
    app.post('/api/register', users.register);
    app.post('/api/verify', users.verify);
    app.post('/api/remember-password', users.rememberPassword);
    app.post('/api/change-password', users.changePassword);
    */

    app.get('/api/admin/users/find-all', restrictRole(['WSTADMIN']), users.UsersFindAll); //restrictRole('52932c90dc7bb5e81b000006')
    app.get('/api/admin/users/find-one', restrict, users.UsersFindOne);
    app.post('/api/admin/users/create', restrictRole(['WSTADMIN']), users.UsersCreate);
    app.post('/api/admin/users/update/:id', restrictRole(['WSTADMIN']), users.UsersUpdate);
    app.post('/api/admin/users/delete/:id', restrictRole(['WSTADMIN']), users.UsersDelete);
    app.post('/api/admin/users/set-status', restrictRole(['WSTADMIN']), users.UsersSetStatus);
    app.post('/api/logout', restrict, users.logout);
    app.post('/api/remember-password', users.rememberPassword);
    app.post('/api/change-password',restrict, users.changePassword);
    app.get('/api/get-counts',restrict, users.getCounts);
    app.get('/api/get-user-data',restrict, users.getUserData);
    app.get('/api/get-user-objects',restrict, users.getUserObjects);
}


