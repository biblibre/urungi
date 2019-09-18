const config = require('config');
const restrict = require('../../middlewares/restrict');
const mongoose = require('mongoose');
const Report = mongoose.model('Reports');
const pikitia = require('../../helpers/pikitia');

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

    app.get('/api/reports/:id.png', async function (req, res, next) {
        try {
            const report = await Report.findById(req.params.id);
            if (!(report && (req.isAuthenticated() || report.isPublic))) {
                return res.sendStatus(404);
            }

            const url = config.get('url') + `/#/reports/view/${report.id}`;
            const buffer = await pikitia.toPNG(url, {
                cookies: req.cookies,
                viewport: {
                    width: 1920,
                    height: 1080,
                },
            });

            const filename = report.reportName.replace(/"/g, '_') + '.png';
            res.set('Content-Disposition', 'attachment; filename="' + filename + '"');
            res.set('Content-Type', 'image/png');
            res.status(200).send(buffer);
        } catch (e) {
            return next(e);
        }
    });

    app.get('/api/reports/:id.pdf', async function (req, res, next) {
        try {
            const report = await Report.findById(req.params.id);
            if (!(report && (req.isAuthenticated() || report.isPublic))) {
                return res.sendStatus(404);
            }

            const url = config.get('url') + `/#/reports/view/${report.id}`;
            const buffer = await pikitia.toPDF(url, { cookies: req.cookies });

            const filename = report.reportName.replace(/"/g, '_') + '.pdf';
            res.set('Content-Disposition', 'attachment; filename="' + filename + '"');
            res.set('Content-Type', 'application/pdf');
            res.status(200).send(buffer);
        } catch (e) {
            return next(e);
        }
    });
};
