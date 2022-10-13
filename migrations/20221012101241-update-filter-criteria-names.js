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
        // await db.collection('reports').find({}).forEach(function (report) {
        //     const filters = report.properties.filters;
        //     let date1;
        //     let date2;
        //     for (const filter of filters) {
        //         if (filter.elementType === 'date') {
        //             console.log(filter);
        //             date1 = filter.criterion.text1 ? filter.criterion.text1 : '';
        //             date2 = filter.criterion.text2 ? filter.criterion.text2 : '';
        //         };
        //     }
        // await db.collection('reports').updateMany({ 'properties.filters.$[elementType]': 'date' }, {
        //     $set: {
        //         'properties.filters.$[criterion].date1': 'properties.filters.$[criterion].text1'
        //     }
        // },
        // {
        //     arrayFilters: [{ 'criterion.text1': { $exists: true } }]
        // }
        // );
        await db.collection('reports').find({ 'properties.filters': { $elemMatch: { elementType: 'date' } } }).forEach(function (report) {
            for (const filter of report.properties.filters) {
                if (filter.criterion) {
                    const text1Value = filter.criterion.text1;
                    const text2Value = filter.criterion.text2;
                    db.collection('reports').updateOne({ _id: report._id },
                        {
                            $push:
                            { 'properties.filters': { date1: text1Value } }
                        },
                    );
                }
            }
        });

        // });

        // await db.collection('dashboard').find({}).forEach(function (dashboard) {
        //     const reportFilters = dashboard.reports.properties.filters;
        //     for (const reportFilter of reportFilters) {
        //         if (reportFilter.elementType === 'date') {
        //             reportFilter.criterion.date1 = reportFilter.criterion.text1 ? reportFilter.criterion.text1 : '';
        //             reportFilter.criterion.date2 = reportFilter.criterion.text2 ? reportFilter.criterion.text2 : '';
        //         }
        //     }
        // });
    }
};
