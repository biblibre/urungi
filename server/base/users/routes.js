module.exports = function (app) {
    var users = require('../controllers/users.js');

    /* USERS */
    app.post('/api/register', users.register);
    app.post('/api/verify', users.verify);
    app.post('/api/remember-password', users.rememberPassword);
    app.post('/api/change-password', users.changePassword);

    app.get('/api/users/get-user', restrict, users.usersGetUser);
    app.post('/api/users/create-user', restrict, users.usersCreateUser);
    app.post('/api/users/update-user/:id', restrict, users.usersUpdateUser);
    app.get('/api/users/get-profile', restrict, users.usersGetProfile);
    app.post('/api/users/update-profile/:id', restrict, users.usersUpdateProfile);

    app.get('/api/admin/users/find-all', restrictRole('52988ac5df1fcbc201000008'), users.adminUsersFindAll); //restrictRole('52932c90dc7bb5e81b000006')
    app.get('/api/admin/users/find-one', restrictRole('52988ac5df1fcbc201000008'), users.adminUsersFindOne);
    app.post('/api/admin/users/create', restrictRole('52988ac5df1fcbc201000008'), users.adminUsersCreate);
    app.post('/api/admin/users/update/:id', restrictRole('52988ac5df1fcbc201000008'), users.adminUsersUpdate);
    app.post('/api/admin/users/delete/:id', restrictRole('52988ac5df1fcbc201000008'), users.adminUsersDelete);
    app.post('/api/admin/users/set-status', restrictRole('52988ac5df1fcbc201000008'), users.adminUsersSetStatus);

    app.post('/api/logout', restrict, users.logout);
}


