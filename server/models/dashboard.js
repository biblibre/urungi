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
    selectedLayerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Layer' },
});

const dashboardSchema = new mongoose.Schema({
    author: { type: String },
    backgroundColor: { type: String },
    backgroundImage: { type: String },
    companyID: { type: String, required: true },
    createdBy: { type: String },
    createdOn: { type: Date },
    dashboardDescription: { type: String },
    dashboardName: { type: String, required: true },
    dashboardType: { type: String },
    history: [],
    html: { type: String },
    isPublic: { type: Boolean },
    isShared: { type: Boolean },
    items: [],
    nd_trash_deleted: { type: Boolean },
    nd_trash_deleted_date: { type: Date },
    owner: { type: String },
    parentFolder: { type: String },
    properties: { type: Object },
    reports: [dashboardReportSchema],
    theme: String,
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

dashboardSchema.query.byFolder = function (folderId) {
    return this.where({ parentFolder: folderId, isShared: true });
};

module.exports = mongoose.model('Dashboard', dashboardSchema);
