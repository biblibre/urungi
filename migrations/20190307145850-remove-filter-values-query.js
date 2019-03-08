module.exports = {
    async up (db) {
        const Reports = db.collection('wst_Reports');
        const Dashboards = db.collection('wst_Dashboardsv2');

        function removeFilterValuesQueryFromReport (report) {
            for (const filter of report.query.filters) {
                delete filter.filterValuesQuery;
            }
            for (const filter of report.properties.filters) {
                delete filter.filterValuesQuery;
            }
            if (report.properties.chart && report.properties.chart.query) {
                for (const filter of report.properties.chart.query.filters) {
                    delete filter.filterValuesQuery;
                }
            }

            return report;
        }

        const reports = await Reports.find().toArray();
        for (const report of reports) {
            removeFilterValuesQueryFromReport(report);
            await Reports.replaceOne({ _id: report._id }, report);
        }

        const dashboards = await Dashboards.find().toArray();
        for (const dashboard of dashboards) {
            for (const report of dashboard.reports) {
                removeFilterValuesQueryFromReport(report);
            }
            await Dashboards.replaceOne({ _id: dashboard._id }, dashboard);
        }
    },

    down (db) {
    }
};
