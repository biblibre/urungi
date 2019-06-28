var mongoose = require('mongoose');

var logsSchema = new mongoose.Schema({
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
}, { collection: 'wst_Logs' });

// Log Types
// 100 info
// 200 warnings
// 300 error
// 400 SQL

logsSchema.statics.saveToLog = function (req, data, otherInfo, done) {
    if (req.user) { var companyID = req.user.companyID; }

    let log;
    if (req) {
        log = {
            text: data.text,
            otherInfo: otherInfo,
            type: data.type,
            companyID: companyID,
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

// admin methods

logsSchema.statics.adminFindAll = function (req, done) {
    var Log = this;
    var perPage = config.pagination.itemsPerPage;
    var page = (req.query.page) ? req.query.page : 1;
    var find = {};
    var searchText = (req.query.search) ? req.query.search : false;

    if (searchText) { find = { $or: [ { text: { $regex: searchText } }, { user_id: { $regex: searchText } } ] }; }

    this.find(find, {}, { skip: (page - 1) * perPage, limit: perPage, sort: { created: -1 } }, function (err, logs) {
        if (err) throw err;

        Log.countDocuments(find, function (err, count) {
            if (err) { console.error(err); }

            done({ result: 1, page: page, pages: Math.ceil(count / perPage), logs: logs });
        });
    });
};

// var Log = mongoose.model("Log", logsSchema);
var Logs = connection.model('Logs', logsSchema);
module.exports = Logs;
