var mongoose = require('mongoose');

const ReportColumnSchema = new mongoose.Schema({
    aggregation: String,
    collectionID: String,
    component: Number,
    data_type: String,
    doNotStack: Boolean,
    elementID: String,
    elementLabel: String,
    elementName: String,
    elementType: String,
    elementRole: String,
    expression: String,
    filterTypeLabel: String,
    filterTypePrompt: Boolean,
    filterType: String,
    id: String,
    isCustom: Boolean,
    layerID: mongoose.Schema.Types.ObjectId,
    objectLabel: String,
    originalLabel: String,
    visible: Boolean,
    zone: String,
});

const ReportFilterSchema = ReportColumnSchema.clone();
ReportFilterSchema.add({
    criterion: {
        date1: String,
        date2: String,
        datePattern: String,
        label: String, // Label of date pattern
        text1: String,
        text2: String,
        textList: [ String ],
    },
    promptAllowMultipleSelection: Boolean,
    promptInstructions: String,
    promptMandatory: Boolean,
    promptTitle: String,
});

const ReportQuerySchema = new mongoose.Schema({
    columns: [ ReportColumnSchema ],
    filters: [ ReportFilterSchema ],
    layerID: mongoose.Schema.Types.ObjectId,
    order: [ ReportColumnSchema ],
});

const ReportPropertiesSchema = new mongoose.Schema({
    columns: [ ReportColumnSchema ],
    connectedComponent: Number, // FIXME This should not be stored
    filters: [ ReportFilterSchema ],
    height: Number,
    legendPosition: String,
    maxValue: Number,
    order: [ ReportColumnSchema ],
    pivotKeys: {
        columns: [ ReportColumnSchema ],
        rows: [ ReportColumnSchema ],
    },
    xkeys: [ ReportColumnSchema ],
    ykeys: [ ReportColumnSchema ],
});

var ReportsSchema = new mongoose.Schema({
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
    query: ReportQuerySchema,
    reportDescription: { type: String }, // FIXME This is not used
    reportName: { type: String, required: true },
    reportSubType: { type: String }, // FIXME This is not used
    reportType: { type: String },
    selectedLayerID: mongoose.Schema.Types.ObjectId,
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
