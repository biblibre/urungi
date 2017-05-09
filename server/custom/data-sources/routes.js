module.exports = function (app) {
    var DataSources = require('./controller.js');

    /* data-sources */
    app.get('/api/data-sources/find-all', restrictRole(['WSTADMIN']), DataSources.DataSourcesFindAll);
    app.get('/api/data-sources/find-one', restrictRole(['WSTADMIN']), DataSources.DataSourcesFindOne);
    app.post('/api/data-sources/create', restrictRole(['WSTADMIN']), DataSources.DataSourcesCreate);
    app.post('/api/data-sources/upload-config-file', restrictRole(['WSTADMIN']), DataSources.DataSourcesUploadConfigFile);
    app.post('/api/data-sources/update/:id', restrictRole(['WSTADMIN']), DataSources.DataSourcesUpdate);
    app.post('/api/data-sources/testS3Connection', restrictRole(['WSTADMIN']), DataSources.getS3Files);
    app.post('/api/data-sources/testConnection', restrictRole(['WSTADMIN']), DataSources.testConnection);
    app.get('/api/data-sources/get-element-distinct-values', restrictRole(['WSTADMIN']), DataSources.getElementDistinctValues);
    app.get('/api/data-sources/getEntities',restrictRole(['WSTADMIN']), DataSources.getEntities);
    app.get('/api/data-sources/getEntitySchema', restrictRole(['WSTADMIN']), DataSources.getEntitySchema);
    app.get('/api/data-sources/getsqlQuerySchema', restrictRole(['WSTADMIN']), DataSources.getsqlQuerySchema);
    app.get('/api/data-sources/getReverseEngineering', restrictRole(['WSTADMIN']), DataSources.getReverseEngineering);
};
