module.exports = function (app) {
    var Dashboards = require('./controller.js');

    /* Reports */
    app.get('/api/dashboards/find-all', restrict, Dashboards.DashboardsFindAll);
    app.get('/api/dashboards/find-one', restrict, Dashboards.DashboardsFindOne);
    app.post('/api/dashboards/create', restrict, Dashboards.DashboardsCreate);
    app.post('/api/dashboards/update/:id', restrict, Dashboards.DashboardsUpdate);
    app.post('/api/dashboards/delete/:id', restrict, Dashboards.DashboardsDelete);
    app.get('/api/dashboards/get/:id', restrict, Dashboards.getDashboard);
    app.post('/api/dashboards/publish-dashboard', restrict, Dashboards.PublishDashboard);
    app.post('/api/dashboards/unpublish', restrict, Dashboards.UnpublishDashboard);
    app.post('/api/dashboards/share-dashboard', restrict, Dashboards.ShareDashboard);
    app.post('/api/dashboards/unshare', restrict, Dashboards.UnshareDashboard);
};
