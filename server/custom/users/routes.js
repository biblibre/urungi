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
    app.post('/api/admin/users/change-user-status', restrictRole(['WSTADMIN']), users.changeUserStatus);
    app.post('/api/logout', restrict, users.logout);
    app.post('/api/remember-password', users.rememberPassword);
    app.post('/api/change-my-password',restrict, users.changeMyPassword);
    app.get('/api/get-counts',restrict, users.getCounts);
    app.get('/api/get-user-counts/:id',restrict, users.getCountsForUser);
    app.get('/api/get-user-reports/:id',restrict, users.getUserReports);
    app.get('/api/get-user-dashboards/:id',restrict, users.getUserDashboards);
    app.get('/api/get-user-data',restrict, users.getUserData);
    app.get('/api/get-user-objects',restrict, users.getUserObjects);
    app.get('/api/get-user-last-executions',restrict, users.getUserLastExecutions);
}


