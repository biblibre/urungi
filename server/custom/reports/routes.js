module.exports = function (app) {
    var Reports = require('./controller.js');

    /* Reports */
    app.get('/api/reports/find-all', restrict, Reports.ReportsFindAll);
    app.get('/api/reports/find-one', restrict, Reports.ReportsFindOne);
    app.post('/api/reports/create', restrict, Reports.ReportsCreate);
    app.post('/api/reports/update/:id', restrict, Reports.ReportsUpdate);
    app.post('/api/reports/delete/:id', restrict, Reports.ReportsDelete);
    app.get('/api/reports/preview-query',restrict, Reports.PreviewQuery);
    app.get('/api/reports/get-data',restrict, Reports.ReportsGetData);
    app.get('/api/reports/get-report/:id',restrict, Reports.GetReport);
    app.post('/api/reports/publish-report', restrict, Reports.PublishReport);
    app.post('/api/reports/unpublish', restrict, Reports.UnpublishReport);
};