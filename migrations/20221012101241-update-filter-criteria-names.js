module.exports = {
    async up (db) {
        const reports = await db.collection('reports').find({}).toArray();
        for (const report of reports) {
            for (const filter of report.properties.filters) {
                if (filter.criterion.date1) {
                    filter.criterion.text1 = filter.criterion.date1;
                }
                if (filter.criterion.date2) {
                    filter.criterion.text2 = filter.criterion.date2;
                }
                delete filter.criterion.date1;
                delete filter.criterion.date2;
            }
            await db.collection('reports').replaceOne({ _id: report._id }, report);
        }

        const dashboards = await db.collection('dashboards').find({}).toArray();
        for (const dashboard of dashboards) {
            const reports = dashboard.reports;
            for (const report of reports) {
                const reportFilters = report.properties.filters;
                for (const reportFilter of reportFilters) {
                    if (reportFilter.criterion.date1) {
                        reportFilter.criterion.text1 = reportFilter.criterion.date1;
                    }
                    if (reportFilter.criterion.date2) {
                        reportFilter.criterion.text2 = reportFilter.criterion.date2;
                    }
                    delete reportFilter.criterion.date1;
                    delete reportFilter.criterion.date2;
                }
            }
            await db.collection('dashboards').replaceOne({ _id: dashboard._id }, dashboard);
        }
    },

    async down (db) {
        const reports = await db.collection('reports').find({ 'properties.filters': { $elemMatch: { elementType: 'date' } } }).toArray();
        for (const report of reports) {
            for (const filter of report.properties.filters) {
                if (filter.elementType === 'date') {
                    filter.criterion.date1 = filter.criterion.text1;
                    filter.criterion.date2 = filter.criterion.text2;
                }
            }
            await db.collection('reports').replaceOne({ _id: report._id }, report);
        }

        const dashboards = await db.collection('dashboards').find({}).toArray();
        for (const dashboard of dashboards) {
            const reports = dashboard.reports;
            for (const report of reports) {
                const reportFilters = report.properties.filters;
                for (const reportFilter of reportFilters) {
                    if (reportFilter.elementType === 'date') {
                        reportFilter.criterion.date1 = reportFilter.criterion.text1;
                        reportFilter.criterion.date2 = reportFilter.criterion.text2;
                    }
                }
            }
            await db.collection('dashboards').replaceOne({ _id: dashboard._id }, dashboard);
        }
    }
};
