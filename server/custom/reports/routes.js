const config = require('config');
const restrict = require('../../middlewares/restrict');
const mongoose = require('mongoose');
const Report = mongoose.model('Report');
const pikitia = require('../../helpers/pikitia');

module.exports = function (app) {
    var Reports = require('./controller.js');

    /* Reports */
    app.get('/api/reports/find-all', restrict, Reports.ReportsFindAll);
    app.get('/api/reports/find-one', restrict, Reports.ReportsFindOne);
    app.post('/api/reports/create', restrict, Reports.ReportsCreate);
    app.post('/api/reports/update/:id', restrict, Reports.ReportsUpdate);
    app.post('/api/reports/delete/:id', restrict, Reports.ReportsDelete);
    app.get('/api/reports/get-report/:id', Reports.GetReport);
    app.post('/api/reports/publish-report', restrict, Reports.PublishReport);
    app.post('/api/reports/unpublish', restrict, Reports.UnpublishReport);
    app.post('/api/reports/share-report', restrict, Reports.ShareReport);
    app.post('/api/reports/unshare', restrict, Reports.UnshareReport);

    app.post('/api/reports/data-query', Reports.dataQuery);
    app.post('/api/reports/filter-values-query', Reports.filterValuesQuery);

    app.post('/api/reports/:id/png', async function (req, res, next) {
        try {
            const report = await Report.findById(req.params.id);
            if (!(report && (req.isAuthenticated() || report.isPublic))) {
                return res.sendStatus(404);
            }

            const url = config.get('url') + config.get('base') + `/reports/view/${report.id}`;
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

    app.post('/api/reports/:id/pdf', async function (req, res, next) {
        try {
            const report = await Report.findById(req.params.id);
            if (!(report && (req.isAuthenticated() || report.isPublic))) {
                return res.sendStatus(404);
            }

            const url = config.get('url') + config.get('base') + `/reports/view/${report.id}`;
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
