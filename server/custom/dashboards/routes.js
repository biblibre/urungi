const config = require('config');
const restrict = require('../../middlewares/restrict');
const pikitia = require('../../helpers/pikitia');

module.exports = function (app) {
    var Dashboards = require('./controller.js');

    app.get('/api/dashboards/find-all', restrict, Dashboards.DashboardsFindAll);
    app.get('/api/dashboards/find-one', restrict, Dashboards.DashboardsFindOne);
    app.post('/api/dashboards/create', restrict, Dashboards.DashboardsCreate);
    app.post('/api/dashboards/update/:id', restrict, Dashboards.DashboardsUpdate);
    app.post('/api/dashboards/delete/:id', restrict, Dashboards.DashboardsDelete);
    app.get('/api/dashboards/get/:id', Dashboards.getDashboard);
    app.post('/api/dashboards/publish-page', restrict, Dashboards.PublishDashboard);
    app.post('/api/dashboards/unpublish', restrict, Dashboards.UnpublishDashboard);
    app.post('/api/dashboards/share-page', restrict, Dashboards.ShareDashboard);
    app.post('/api/dashboards/unshare', restrict, Dashboards.UnshareDashboard);

    app.post('/api/dashboards/:id/png', async function (req, res, next) {
        const mongoose = require('mongoose');
        const Dashboard = mongoose.model('Dashboard');

        try {
            const dashboard = await Dashboard.findById(req.params.id);
            if (!(dashboard && (req.isAuthenticated() || dashboard.isPublic))) {
                return res.sendStatus(404);
            }

            const url = config.get('url') + config.get('base') + `/dashboards/view/${dashboard.id}`;
            const buffer = await pikitia.toPNG(url, {
                cookies: req.cookies,
                viewport: {
                    width: 1920,
                    height: 1080,
                },
            });

            const response = {
                data: buffer.toString('base64'),
            };

            res.status(200).json(response);
        } catch (e) {
            return next(e);
        }
    });

    app.post('/api/dashboards/:id/pdf', async function (req, res, next) {
        const mongoose = require('mongoose');
        const Dashboard = mongoose.model('Dashboard');

        try {
            const dashboard = await Dashboard.findById(req.params.id);
            if (!(dashboard && (req.isAuthenticated() || dashboard.isPublic))) {
                return res.sendStatus(404);
            }

            const url = config.get('url') + config.get('base') + `/dashboards/view/${dashboard.id}`;
            const options = {
                cookies: req.cookies,
                displayHeaderFooter: req.body.displayHeaderFooter || false,
                headerTemplate: req.body.headerTemplate || '',
                footerTemplate: req.body.footerTemplate || '',
            };

            const buffer = await pikitia.toPDF(url, options);

            const response = {
                data: buffer.toString('base64'),
            };

            res.status(200).json(response);
        } catch (e) {
            return next(e);
        }
    });
};
