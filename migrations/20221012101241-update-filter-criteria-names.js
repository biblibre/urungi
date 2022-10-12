module.exports = {
    async up (db) {
        await db.collection('reports').find({}).forEach(function (report) {
            if (report.properties.filters.elementType === 'date') {
                for (const filter of report.properties.filters) {
                    filter.criterion.text1 = filter.criterion.date1 ? filter.criterion.date1 : '';
                    filter.criterion.text2 = filter.criterion.date2 ? filter.criterion.date2 : '';
                }
            }
        });

        await db.collection('dashboard').find({}).forEach(function (dashboard) {
            const reportFilters = dashboard.reports.properties.filters;
            for (const reportFilter of reportFilters) {
                if (reportFilter.elementType === 'date') {
                    reportFilter.criterion.text1 = reportFilter.criterion.date1 ? reportFilter.criterion.date1 : '';
                    reportFilter.criterion.text2 = reportFilter.criterion.date2 ? reportFilter.criterion.date2 : '';
                }
            }
        });
    },

    async down (db) {
        await db.collection('reports').find({}).forEach(function (report) {
            if (report.properties.filters.elementType === 'date') {
                for (const filter of report.properties.filters) {
                    filter.criterion.date1 = filter.criterion.text1 ? filter.criterion.text1 : '';
                    filter.criterion.date2 = filter.criterion.text2 ? filter.criterion.text2 : '';
                }
            }
        });
        await db.collection('dashboard').find({}).forEach(function (dashboard) {
            const reportFilters = dashboard.reports.properties.filters;
            for (const reportFilter of reportFilters) {
                if (reportFilter.elementType === 'date') {
                    reportFilter.criterion.date1 = reportFilter.criterion.text1 ? reportFilter.criterion.text1 : '';
                    reportFilter.criterion.date2 = reportFilter.criterion.text2 ? reportFilter.criterion.text2 : '';
                }
            }
        });
    }
};
