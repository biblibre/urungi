const restrict = require('../../middlewares/restrict');
const restrictAdmin = require('../../middlewares/restrict-admin');

module.exports = function (app) {
    var users = require('./controller.js');
    app.get('/api/admin/users/find-all', restrictAdmin, users.UsersFindAll);
    app.get('/api/admin/users/find-one', restrict, users.UsersFindOne);
    app.post('/api/admin/users/create', restrictAdmin, users.UsersCreate);
    app.post('/api/admin/users/update/:id', restrictAdmin, users.UsersUpdate);
    app.post('/api/admin/users/delete/:id', restrictAdmin, users.UsersDelete);
    app.post('/api/admin/users/change-user-status', restrictAdmin, users.changeUserStatus);
    app.post('/api/logout', restrict, users.logout);
    app.post('/api/change-my-password', restrict, users.changeMyPassword);
    app.get('/api/get-counts', restrict, users.getCounts);
    app.get('/api/get-user-counts/:id', restrict, users.getCountsForUser);
    app.get('/api/get-user-reports/:id', restrict, users.getUserReports);
    app.get('/api/get-user-dashboards/:id', restrict, users.getUserDashboards);
    app.get('/api/get-user-data', restrict, users.getUserData);
    app.get('/api/get-user-objects', restrict, users.getUserObjects);
    app.get('/api/get-user-last-executions', restrict, users.getUserLastExecutions);
    app.get('/api/set-viewed-context-help', restrict, users.setViewedContextHelp);
    app.get('/api/get-user-other-data', restrict, users.getUserOtherData);
};
