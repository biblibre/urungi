module.exports = function (app) {
    var Dashboardsv2 = require('./controller.js');

    /* Reports */
    app.get('/api/dashboardsv2/find-all', restrict, Dashboardsv2.Dashboardsv2FindAll);
    app.get('/api/dashboardsv2/find-one', restrict, Dashboardsv2.Dashboardsv2FindOne);
    app.post('/api/dashboardsv2/create', restrict, Dashboardsv2.Dashboardsv2Create);
    app.post('/api/dashboardsv2/duplicate', restrict, Dashboardsv2.Dashboardsv2Duplicate);
    app.post('/api/dashboardsv2/update/:id', restrict, Dashboardsv2.Dashboardsv2Update);
    app.post('/api/dashboardsv2/delete/:id', restrict, Dashboardsv2.Dashboardsv2Delete);
    app.get('/api/dashboardsv2/get/:id', restrict, Dashboardsv2.getDashboard);
    app.post('/api/dashboardsv2/publish-page', restrict, Dashboardsv2.PublishDashboard);
    app.post('/api/dashboardsv2/unpublish', restrict, Dashboardsv2.UnpublishDashboard);
};
