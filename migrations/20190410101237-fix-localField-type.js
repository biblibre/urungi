const ObjectID = require('mongodb').ObjectID;
module.exports = {
    async up (db) {
        var operations = [];

        const reports = await db.collection('wst_Reports').find().toArray();
        reports.forEach(report => {
            var layerID = report.selectedLayerID;
            operations.push({
                'updateOne': {
                    'filter': { '_id': report._id },
                    'update': {
                        '$set': { 'selectedLayerID': ObjectID(layerID) }
                    }
                }
            });
        });

        if (operations.length > 0) {
            return db.collection('wst_Reports').bulkWrite(operations);
        }
    },

    async down (db) {
        var operations = [];

        const reports = await db.collection('wst_Reports').find().toArray();
        reports.forEach(report => {
            var layerID = report.selectedLayerID;
            operations.push({
                'updateOne': {
                    'filter': { '_id': report._id },
                    'update': {
                        '$set': { 'selectedLayerID': String(layerID) }
                    }
                }
            });
        });

        if (operations.length > 0) {
            return db.collection('wst_Reports').bulkWrite(operations);
        }
    }
};
