const config = require('config');
const restrict = require('../../middlewares/restrict');
const pikitia = require('../../helpers/pikitia');

module.exports = function (app) {
    var Dashboardsv2 = require('./controller.js');

    /* Reports */
    app.get('/api/dashboardsv2/find-all', restrict, Dashboardsv2.Dashboardsv2FindAll);
    app.get('/api/dashboardsv2/find-one', restrict, Dashboardsv2.Dashboardsv2FindOne);
    app.post('/api/dashboardsv2/create', restrict, Dashboardsv2.Dashboardsv2Create);
    app.post('/api/dashboardsv2/duplicate', restrict, Dashboardsv2.Dashboardsv2Duplicate);
    app.post('/api/dashboardsv2/update/:id', restrict, Dashboardsv2.Dashboardsv2Update);
    app.post('/api/dashboardsv2/delete/:id', restrict, Dashboardsv2.Dashboardsv2Delete);
    app.get('/api/dashboardsv2/get/:id', Dashboardsv2.getDashboard);
    app.post('/api/dashboardsv2/publish-page', restrict, Dashboardsv2.PublishDashboard);
    app.post('/api/dashboardsv2/unpublish', restrict, Dashboardsv2.UnpublishDashboard);
    app.post('/api/dashboardsv2/share-page', restrict, Dashboardsv2.ShareDashboard);
    app.post('/api/dashboardsv2/unshare', restrict, Dashboardsv2.UnshareDashboard);

    app.get('/api/dashboards/:id.png', async function (req, res, next) {
        const mongoose = require('mongoose');
        const Dashboard = mongoose.model('Dashboard');

        try {
            const dashboard = await Dashboard.findById(req.params.id);
            if (!(dashboard && (req.isAuthenticated() || dashboard.isPublic))) {
                return res.sendStatus(404);
            }

            const url = config.get('url') + `/#/dashboards/view/${dashboard.id}`;
            const buffer = await pikitia.toPNG(url, {
                cookies: req.cookies,
                viewport: {
                    width: 1920,
                    height: 1080,
                },
            });

            const filename = dashboard.dashboardName.replace(/"/g, '_') + '.png';

            res.set('Content-Disposition', 'attachment; filename="' + filename + '"');
            res.set('Content-Type', 'image/png');
            res.status(200).send(buffer);
        } catch (e) {
            return next(e);
        }
    });

    app.get('/api/dashboards/:id.pdf', async function (req, res, next) {
        const mongoose = require('mongoose');
        const Dashboard = mongoose.model('Dashboard');

        try {
            const dashboard = await Dashboard.findById(req.params.id);
            if (!(dashboard && (req.isAuthenticated() || dashboard.isPublic))) {
                return res.sendStatus(404);
            }

            const url = config.get('url') + `/#/dashboards/view/${dashboard.id}`;
            const buffer = await pikitia.toPDF(url, { cookies: req.cookies });

            const filename = dashboard.dashboardName.replace(/"/g, '_') + '.pdf';
            res.set('Content-Disposition', 'attachment; filename="' + filename + '"');
            res.set('Content-Type', 'application/pdf');
            res.status(200).send(buffer);
        } catch (e) {
            return next(e);
        }
    });
};
