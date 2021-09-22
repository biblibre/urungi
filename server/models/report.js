const mongoose = require('mongoose');

const reportColumnSchema = new mongoose.Schema({
    aggregation: String,
    calculateTotal: Boolean,
    collectionID: String,
    doNotStack: Boolean,
    elementID: String,
    elementLabel: String,
    elementName: String,
    elementType: String,
    elementRole: String,
    expression: String,
    filterType: String,
    format: String,
    id: String,
    isCustom: Boolean,
    label: String,
    layerID: mongoose.Schema.Types.ObjectId,
    sortType: Number,
    type: { type: String },
    icon: {},
});

reportColumnSchema.virtual('layerObject').get(function () {
    const report = this.parent().parent();
    if (report.selectedLayerID.findObject) {
        return report.selectedLayerID.findObject(this.elementID);
    }
});

const reportFilterSchema = reportColumnSchema.clone();
reportFilterSchema.add({
    conditionType: String,
    criterion: {
        date1: String,
        date2: String,
        datePattern: String,
        label: String, // Label of date pattern
        text1: String,
        text2: String,
        textList: [String],
    },
    filterPrompt: Boolean,
    promptAllowMultipleSelection: Boolean,
    promptInstructions: String,
    promptMandatory: Boolean,
    promptTitle: String,
});

const ReportPropertiesSchema = new mongoose.Schema({
    columns: [reportColumnSchema],
    filters: [reportFilterSchema],
    height: Number,
    mapLayerUrl: String,
    legendPosition: String,
    map: {
        geojson: [reportColumnSchema],
        label: [reportColumnSchema],
        value: [reportColumnSchema],
        group: [reportColumnSchema],
        type: { type: [reportColumnSchema] },
    },
    maxValue: Number,
    order: [reportColumnSchema],
    pivotKeys: {
        columns: [reportColumnSchema],
        rows: [reportColumnSchema],
    },
    range: String,
    recordLimit: Number,
    xkeys: [reportColumnSchema],
    ykeys: [reportColumnSchema],
});

const reportSchema = new mongoose.Schema({
    author: { type: String }, // Creator's user name
    companyID: { type: String },
    createdBy: { type: String }, // Creator's id
    createdOn: { type: Date },
    history: [], // FIXME This is not used
    isPublic: { type: Boolean },
    isShared: { type: Boolean },
    nd_trash_deleted: { type: Boolean },
    nd_trash_deleted_date: { type: Date },
    owner: { type: String }, // Same as createdBy
    parentFolder: { type: String },
    properties: ReportPropertiesSchema,
    reportDescription: { type: String }, // FIXME This is not used
    reportName: { type: String, required: true },
    reportSubType: { type: String }, // FIXME This is not used
    reportType: { type: String },
    selectedLayerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Layer', required: true },
    theme: String,
}, { collation: { locale: 'en', strength: 2 } });

reportSchema.methods.publish = async function () {
    this.isPublic = true;

    return this.save();
};

reportSchema.methods.unpublish = async function () {
    this.isPublic = false;

    return this.save();
};

reportSchema.methods.share = async function (folderId) {
    this.parentFolder = folderId;
    this.isShared = true;

    return this.save();
};

reportSchema.methods.unshare = async function () {
    this.parentFolder = undefined;
    this.isShared = false;

    return this.save();
};

reportSchema.query.byFolder = function (folderId) {
    return this.where({ parentFolder: folderId, isShared: true });
};

module.exports = mongoose.model('Report', reportSchema);
