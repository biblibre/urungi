module.exports = {
    async up (db) {
        await db.collection('wst_Reports').updateMany({}, { $unset: { query: '' } });

        const dashboardsCollection = db.collection('wst_Dashboardsv2');
        const dashboards = await dashboardsCollection.find().toArray();
        for (const dashboard of dashboards) {
            for (const report of dashboard.reports) {
                delete report.query;
            }
            await dashboardsCollection.findOneAndReplace({ _id: dashboard._id }, dashboard);
        }
    },

    async down (db) {
        const reportsCollection = db.collection('wst_Reports');
        const reports = await reportsCollection.find().toArray();
        for (const report of reports) {
            report.query = generateQuery(report);
            await reportsCollection.findOneAndReplace({ _id: report._id }, report);
        }

        const dashboardsCollection = db.collection('wst_Dashboardsv2');
        const dashboards = await dashboardsCollection.find().toArray();
        for (const dashboard of dashboards) {
            for (const report of dashboard.reports) {
                report.query = generateQuery(report);
            }
            await dashboardsCollection.findOneAndReplace({ _id: dashboard._id }, dashboard);
        }
    }
};

function generateQuery (report) {
    const query = {};

    const columns = [];
    if (Array.isArray(report.properties.columns)) {
        columns.push.apply(columns, report.properties.columns);
    }
    if (Array.isArray(report.properties.xkeys)) {
        columns.push.apply(columns, report.properties.xkeys);
    }
    if (Array.isArray(report.properties.ykeys)) {
        columns.push.apply(columns, report.properties.ykeys);
    }
    if (report.properties.pivotKeys && Array.isArray(report.properties.pivotKeys.columns)) {
        columns.push.apply(columns, report.properties.pivotKeys.columns);
    }
    if (report.properties.pivotKeys && Array.isArray(report.properties.pivotKeys.rows)) {
        columns.push.apply(columns, report.properties.pivotKeys.rows);
    }
    query.columns = columns;

    query.order = report.properties.order ? report.properties.order.slice() : [];
    query.filters = report.properties.filters ? report.properties.filters.slice() : [];

    if (report.reportType === 'pivot') {
        for (const c of report.properties.ykeys) {
            query.columns.push({
                aggregation: 'count',
                collectionID: c.collectionID,
                elementID: c.elementID,
                elementLabel: c.elementLabel,
                elementName: c.elementName,
                elementType: c.elementType,
                filterPrompt: false,
                id: c.id + 'ptc',
                layerID: c.layerID,
            });
        }
    }

    if (report.properties.recordLimit) {
        query.recordLimit = report.properties.recordLimit;
    }

    query.layerID = report.selectedLayerID;

    return query;
}
