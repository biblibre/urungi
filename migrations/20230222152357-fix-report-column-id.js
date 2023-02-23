module.exports = {
    async up (db, client) {
        const reports = await db.collection('reports').find().toArray();
        for (const report of reports) {
            fixReport(report);
            await db.collection('reports').replaceOne({ _id: report._id }, report);
        }

        const dashboards = await db.collection('dashboards').find().toArray();
        for (const dashboard of dashboards) {
            for (const report of dashboard.reports) {
                fixReport(report);
            }
            await db.collection('dashboards').replaceOne({ _id: dashboard._id }, dashboard);
        }
    },

    async down (db, client) {
        // down migration is not useful and not possible anyway
    }
};

function fixReport (report) {
    for (const column of report.properties.columns) {
        column.id = getColumnId(column);
    }
    for (const filter of report.properties.filters) {
        filter.id = getColumnId(filter);
    }
    for (const order of report.properties.order) {
        order.id = getColumnId(order);
    }
    for (const column of report.properties.pivotKeys.columns) {
        column.id = getColumnId(column);
    }
    for (const row of report.properties.pivotKeys.rows) {
        row.id = getColumnId(row);
    }
    for (const xkey of report.properties.xkeys) {
        xkey.id = getColumnId(xkey);
    }
    for (const ykey of report.properties.ykeys) {
        ykey.id = getColumnId(ykey);
    }
}

function getColumnId (element) {
    let columnId;

    const aggregation = element.aggregation;

    if (!aggregation) {
        columnId = 'e' + element.elementID.toLowerCase() + 'raw';
    } else {
        columnId = 'e' + element.elementID.toLowerCase() + aggregation.substring(0, 3);
    }

    return columnId;
}
