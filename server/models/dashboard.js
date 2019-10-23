var mongoose = require('mongoose');
const Report = require('./report');

const dashboardReportSchema = new mongoose.Schema({
    author: { type: String },
    companyID: { type: String },
    createdBy: { type: String },
    createdOn: { type: Date },
    history: [],
    id: String,
    owner: { type: String },
    properties: Report.schema.path('properties'),
    reportDescription: { type: String },
    reportName: { type: String, required: true },
    reportSubType: { type: String },
    reportType: { type: String },
    selectedLayerID: mongoose.Schema.Types.ObjectId,
});

const dashboardSchema = new mongoose.Schema({
    companyID: { type: String, required: true },
    dashboardName: { type: String, required: true },
    dashboardDescription: { type: String },
    dashboardType: { type: String },
    html: { type: String },
    reports: [dashboardReportSchema],
    items: [],
    backgroundColor: { type: String },
    backgroundImage: { type: String },
    properties: { type: Object },
    history: [],
    nd_trash_deleted: { type: Boolean },
    nd_trash_deleted_date: { type: Date },
    owner: { type: String },
    parentFolder: { type: String },
    isPublic: { type: Boolean },
    isShared: { type: Boolean },
    createdBy: { type: String },
    author: { type: String },
    createdOn: { type: Date }
}, { collation: { locale: 'en', strength: 2 } });

dashboardSchema.methods.publish = async function () {
    this.isPublic = true;

    return this.save();
};

dashboardSchema.methods.unpublish = async function () {
    this.isPublic = false;

    return this.save();
};

dashboardSchema.methods.share = async function (folderId) {
    this.parentFolder = folderId;
    this.isShared = true;

    return this.save();
};

dashboardSchema.methods.unshare = async function () {
    this.parentFolder = undefined;
    this.isShared = false;

    return this.save();
};

module.exports = mongoose.model('Dashboard', dashboardSchema);
