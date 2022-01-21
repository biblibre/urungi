const config = require('config');
const express = require('express');
const restrict = require('../../middlewares/restrict');
const assertPikitiaIsConfigured = require('../../middlewares/assert-pikitia-is-configured');
const pikitia = require('../../helpers/pikitia');
const mongoose = require('mongoose');
const Dashboard = mongoose.model('Dashboard');

module.exports = function (app) {
    const Dashboards = require('./controller.js');

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

    const dashboardRouter = express.Router();

    dashboardRouter.use(['/png', '/pdf'], assertPikitiaIsConfigured);

    dashboardRouter.options(['/png', '/pdf'], function (req, res) {
        res.set('Allow', 'POST');
        res.sendStatus(200);
    });

    dashboardRouter.post('/png', async function (req, res, next) {
        try {
            const dashboard = res.locals.dashboard;
            const filters = JSON.stringify(req.body.filters);
            const url = config.get('url') + config.get('base') + `/dashboards/view/${dashboard.id}?filters=${filters}`;
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

    dashboardRouter.post('/pdf', async function (req, res, next) {
        try {
            const dashboard = res.locals.dashboard;
            const filters = JSON.stringify(req.body.filters);
            const url = config.get('url') + config.get('base') + `/dashboards/view/${dashboard.id}?filters=${filters}`;
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

    function findDashboard (req, res, next) {
        Dashboard.findById(req.params.id).then(dashboard => {
            if (!(dashboard && (req.isAuthenticated() || dashboard.isPublic))) {
                return res.sendStatus(404);
            }

            res.locals.dashboard = dashboard;
            next();
        }, () => {
            return res.sendStatus(404);
        });
    }

    app.use('/api/dashboards/:id', findDashboard, dashboardRouter);
};
