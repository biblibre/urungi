const mongoose = require('mongoose');

const statisticSchema = new mongoose.Schema({
    type: String,
    userID: String,
    userName: String,
    ip: String,
    companyID: { type: String },
    relationedID: { type: String },
    relationedName: { type: String },
    action: { type: String }, // 'create', 'update', 'delete'
    createdOn: { type: Date, default: Date.now },
    createdBy: { type: String }
});

statisticSchema.statics.saveStat = function (req, data) {
    const companyID = req.isAuthenticated() ? req.user.companyID : null;

    const statistic = {
        type: data.type,
        relationedID: data.relationedID,
        relationedName: data.relationedName,
        action: data.action,
        companyID: companyID,
        userID: (req.isAuthenticated()) ? req.user._id : null,
        userName: (req.isAuthenticated()) ? req.user.userName : null,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        createdBy: (req.isAuthenticated()) ? req.user._id : null
    };

    return this.create(statistic);
};

statisticSchema.statics.getLastExecutions = function (conditions = {}) {
    conditions.action = 'execute';

    const pipeline = [
        { $match: conditions },
        {
            $group: {
                _id: {
                    relationedID: '$relationedID',
                    relationedName: '$relationedName',
                    type: '$type',
                    action: '$action'
                },
                lastDate: { $max: '$createdOn' }
            }
        },
        { $sort: { lastDate: -1 } },
        { $limit: 10 },
    ];

    return this.aggregate(pipeline).then(docs => {
        const items = docs.map(doc => Object.assign({}, doc._id, {
            lastDate: doc.lastDate,
        }));
        return items;
    });
};

statisticSchema.statics.getMostExecutions = function (conditions = {}) {
    conditions.action = 'execute';

    const pipeline = [
        { $match: conditions },
        {
            $group: {
                _id: {
                    relationedID: '$relationedID',
                    relationedName: '$relationedName',
                    type: '$type',
                    action: '$action'
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
    ];

    return this.aggregate(pipeline).then(docs => {
        const items = docs.map(doc => Object.assign({}, doc._id, {
            count: doc.count,
        }));
        return items;
    });
};

module.exports = mongoose.model('Statistic', statisticSchema);
