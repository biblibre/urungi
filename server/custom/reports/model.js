var mongoose = require('mongoose');

var ReportsSchema = new mongoose.Schema({
    companyID: {type: String},
    reportName: {type: String, required: true},
    reportType: {type: String},
    reportSubType: {type: String},
    properties: {type: Object},
    query: {type: Object},
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date}
}, { collection: config.app.customCollectionsPrefix+'Reports' });

var Reports = connection.model('Reports', ReportsSchema);
module.exports = Reports;
