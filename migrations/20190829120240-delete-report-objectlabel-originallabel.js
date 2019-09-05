module.exports = {
    async up (db) {
        const reportsCollection = db.collection('wst_Reports');
        const reports = await reportsCollection.find().toArray();
        for (const report of reports) {
            cleanupReport(report);
            await reportsCollection.findOneAndReplace({ _id: report._id }, report);
        }

        const dashboardsCollection = db.collection('wst_Dashboardsv2');
        const dashboards = await dashboardsCollection.find().toArray();
        for (const dashboard of dashboards) {
            for (const report of dashboard.reports) {
                cleanupReport(report);
            }
            await dashboardsCollection.findOneAndReplace({ _id: dashboard._id }, dashboard);
        }

        function cleanupReport (report) {
            const columns = getReportColumns(report);
            for (const column of columns) {
                if (column.originalLabel) {
                    column.elementLabel = column.originalLabel;
                }
                delete column.originalLabel;
                delete column.objectLabel;
            }
        }
    },

    async down (db) {
        const reportsCollection = db.collection('wst_Reports');
        const reports = await reportsCollection.find().toArray();
        for (const report of reports) {
            messupReport(report);
            await reportsCollection.findOneAndReplace({ _id: report._id }, report);
        }

        const dashboardsCollection = db.collection('wst_Dashboardsv2');
        const dashboards = await dashboardsCollection.find().toArray();
        for (const dashboard of dashboards) {
            for (const report of dashboard.reports) {
                messupReport(report);
            }
            await dashboardsCollection.findOneAndReplace({ _id: dashboard._id }, dashboard);
        }

        function messupReport (report) {
            const columns = getReportColumns(report);
            for (const column of columns) {
                let elementLabel = column.elementLabel;
                if (column.aggregation) {
                    column.originalLabel = elementLabel;

                    switch (column.aggregation) {
                    case 'sum':
                        elementLabel += ' (Sum)';
                        break;
                    case 'avg':
                        elementLabel += ' (Avg)';
                        break;
                    case 'min':
                        elementLabel += ' (Min)';
                        break;
                    case 'max':
                        elementLabel += ' (Max)';
                        break;
                    case 'count':
                        elementLabel += ' (Count)';
                        break;
                    case 'countDistinct':
                        elementLabel += ' (Count distinct)';
                        break;
                    }
                }

                column.elementLabel = elementLabel;
                column.objectLabel = elementLabel;
            }
        }
    }
};

function getReportColumns (report) {
    const columns = [];

    if (report) {
        if (report.properties) {
            columns.push.apply(columns, report.properties.columns);
            columns.push.apply(columns, report.properties.xkeys);
            columns.push.apply(columns, report.properties.ykeys);
            columns.push.apply(columns, report.properties.order);
            columns.push.apply(columns, report.properties.filters);

            if (report.properties.pivotKeys) {
                columns.push.apply(columns, report.properties.pivotKeys.columns);
                columns.push.apply(columns, report.properties.pivotKeys.rows);
            }
        }

        if (report.query) {
            columns.push.apply(columns, report.query.columns);
            columns.push.apply(columns, report.query.order);
            columns.push.apply(columns, report.query.filters);
        }
    }

    return columns;
}
