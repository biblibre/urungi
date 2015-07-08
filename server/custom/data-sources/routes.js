module.exports = function (app) {
    var DataSources = require('./controller.js');

    /* data-sources */
    app.get('/api/data-sources/find-all', restrict, DataSources.DataSourcesFindAll);
    app.get('/api/data-sources/find-one', restrict, DataSources.DataSourcesFindOne);
    app.post('/api/data-sources/create', restrict, DataSources.DataSourcesCreate);
    app.post('/api/data-sources/update/:id', restrict, DataSources.DataSourcesUpdate);
    //app.post('/api/data-sources/delete/:id', restrict, DataSources.ReportsDelete);
    app.post('/api/data-sources/testS3Connection', restrict, DataSources.getS3Files);
    app.post('/api/data-sources/testMongoConnection', restrict, DataSources.testMongoConnection);
    app.post('/api/data-sources/getMongoSchemas', restrict, DataSources.getMongoSchemas);
    app.get('/api/data-sources/get-element-distinct-values', restrict, DataSources.getElementDistinctValues);
};
