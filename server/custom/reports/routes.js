const restrict = require('../../middlewares/restrict');

module.exports = function (app) {
    var Reports = require('./controller.js');

    /* Reports */
    app.get('/api/reports/find-all', restrict, Reports.ReportsFindAll);
    app.get('/api/reports/find-one', restrict, Reports.ReportsFindOne);
    app.post('/api/reports/create', restrict, Reports.ReportsCreate);
    app.post('/api/reports/update/:id', restrict, Reports.ReportsUpdate);
    app.post('/api/reports/delete/:id', restrict, Reports.ReportsDelete);
    app.post('/api/reports/get-data', Reports.ReportsGetData);
    app.get('/api/reports/get-report/:id', Reports.GetReport);
    app.post('/api/reports/publish-report', restrict, Reports.PublishReport);
    app.post('/api/reports/unpublish', restrict, Reports.UnpublishReport);
    app.post('/api/reports/share-report', restrict, Reports.ShareReport);
    app.post('/api/reports/unshare', restrict, Reports.UnshareReport);
};
