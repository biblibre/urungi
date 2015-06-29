module.exports = function (app) {
    var configurations = require('./controller.js');

    /* CONFIGURATIONS */
    app.get('/api/admin/configurations/find-user-filters', restrictRole('52988ac5df1fcbc201000008'), configurations.adminFindUserFilters);
    app.get('/api/admin/configurations/get-configurations', restrictRole('52988ac5df1fcbc201000008'), configurations.adminGetConfigurations);
    app.post('/api/admin/configurations/save-configurations', restrictRole('52988ac5df1fcbc201000008'), configurations.adminSaveConfigurations);
}


