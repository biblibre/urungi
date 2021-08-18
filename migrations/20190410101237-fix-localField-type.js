const ObjectID = require('mongodb').ObjectID;
module.exports = {
    async up (db) {
        const operations = [];

        const reports = await db.collection('wst_Reports').find().toArray();
        reports.forEach(report => {
            const layerID = report.selectedLayerID;
            operations.push({
                updateOne: {
                    filter: { _id: report._id },
                    update: {
                        $set: { selectedLayerID: ObjectID(layerID) }
                    }
                }
            });
        });

        if (operations.length > 0) {
            return db.collection('wst_Reports').bulkWrite(operations);
        }
    },

    async down (db) {
        const operations = [];

        const reports = await db.collection('wst_Reports').find().toArray();
        reports.forEach(report => {
            const layerID = report.selectedLayerID;
            operations.push({
                updateOne: {
                    filter: { _id: report._id },
                    update: {
                        $set: { selectedLayerID: String(layerID) }
                    }
                }
            });
        });

        if (operations.length > 0) {
            return db.collection('wst_Reports').bulkWrite(operations);
        }
    }
};
