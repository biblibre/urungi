var mongoose = require('mongoose');

var messagesSchema = new mongoose.Schema({
    messageFrom: {type: String, required: true},
    messageFromName: {type: String, required: true},
    message: {type: String},
    messageDate: {type: Date, default: Date.now},
    read: {type: Boolean, required: true, default: false}
});

var ReportsSchema = new mongoose.Schema({
    companyID: {type: String, required: true},
    reportName: {type: String, required: true},
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date}
}, { collection: config.app.customCollectionsPrefix+'Reports' });

var Reports = connection.model('Reports', ReportsSchema);
module.exports = Reports;
