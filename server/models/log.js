const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    text: String,
    type: Number,
    userID: String,
    otherInfo: String,
    ip: String,
    companyID: { type: String },
    relationID: { type: String },
    relationCollection: { type: String },
    action: { type: String }, // 'create', 'update', 'delete'
    code: { type: String },
    associatedID: String,
    createdOn: { type: Date, default: Date.now },
    createdBy: { type: String }
});

// Log Types
// 100 info
// 200 warnings
// 300 error
// 400 SQL

logSchema.statics.saveToLog = function (req, data, otherInfo, done) {
    let companyID;
    if (req.user) { companyID = req.user.companyID; }

    let log;
    if (req) {
        log = {
            text: data.text,
            otherInfo,
            type: data.type,
            companyID,
            associatedID: data.associatedID,
            userID: (req.isAuthenticated()) ? req.user.id : null,
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            code: data.code
        };
    } else {
        log = {
            text: data.text,
            type: data.type
        };
    }

    this.create(log, function (err, log) {
        if (err) throw err;

        if (typeof done !== 'undefined') done({ result: 1, msg: 'Log created', log: log.toObject() });
    });
};

module.exports = mongoose.model('Log', logSchema);
