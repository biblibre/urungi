const restrictAdmin = require('../../middlewares/restrict-admin');

module.exports = function (app) {
    var DataSources = require('./controller.js');

    /* data-sources */
    app.get('/api/data-sources/find-all', restrictAdmin, DataSources.DataSourcesFindAll);
    app.get('/api/data-sources/find-one', restrictAdmin, DataSources.DataSourcesFindOne);
    app.post('/api/data-sources/create', restrictAdmin, DataSources.DataSourcesCreate);
    app.post('/api/data-sources/update/:id', restrictAdmin, DataSources.DataSourcesUpdate);
    app.post('/api/data-sources/testConnection', restrictAdmin, DataSources.testConnection);
    app.get('/api/data-sources/getEntities', restrictAdmin, DataSources.getEntities);
    app.get('/api/data-sources/getEntitySchema', restrictAdmin, DataSources.getEntitySchema);
    app.get('/api/data-sources/getsqlQuerySchema', restrictAdmin, DataSources.getsqlQuerySchema);
};
