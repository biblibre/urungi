module.exports = {
    async up (db) {
        await db.collection('reports').updateMany({}, {
            $unset: {
                'properties.filters.$[].conditionType': '',
            },
        });
        await db.collection('dashboards').updateMany({}, {
            $unset: {
                'reports.$[].properties.filters.$[].conditionType': '',
            },
        });
    },

    async down (db) {
    }
};
