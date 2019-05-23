var mongoose = require('mongoose');

var ReportsSchema = new mongoose.Schema({
    companyID: { type: String },
    reportName: { type: String, required: true },
    reportType: { type: String },
    reportDescription: { type: String },
    reportSubType: { type: String },
    properties: { type: Object },
    query: { type: Object },
    owner: { type: String },
    createdBy: { type: String },
    author: { type: String },
    createdOn: { type: Date },
    history: [],
    parentFolder: { type: String },
    isPublic: { type: Boolean },
    isShared: { type: Boolean },
    nd_trash_deleted: { type: Boolean },
    nd_trash_deleted_date: { type: Date },
    selectedLayerID: mongoose.Schema.Types.ObjectId
}, { collection: 'wst_Reports', collation: { locale: 'en', strength: 2 } });

ReportsSchema.methods.publish = async function () {
    this.isPublic = true;

    return this.save();
};

ReportsSchema.methods.unpublish = async function () {
    this.isPublic = false;

    return this.save();
};

ReportsSchema.methods.share = async function (folderId) {
    this.parentFolder = folderId;
    this.isShared = true;

    return this.save();
};

ReportsSchema.methods.unshare = async function () {
    this.parentFolder = undefined;
    this.isShared = false;

    return this.save();
};

var Reports = connection.model('Reports', ReportsSchema);
module.exports = Reports;
