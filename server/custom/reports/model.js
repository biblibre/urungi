var mongoose = require('mongoose');

var ReportsSchema = new mongoose.Schema({
    companyID: {type: String},
    reportName: {type: String, required: true},
    reportType: {type: String},
    reportDescription: {type: String},
    reportSubType: {type: String},
    properties: {type: Object},
    query: {type: Object},
    owner: {type: String},
    createdBy: {type: String},
    createdOn: {type: Date},
    history: [],
    parentFolder: {type: String},
    isPublic:{type: Boolean},
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date},
    selectedLayerID: {type: String}
}, { collection: 'wst_Reports' });

var Reports = connection.model('Reports', ReportsSchema);
module.exports = Reports;
