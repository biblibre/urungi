var mongoose = require('mongoose');

const layerElementSchema = new mongoose.Schema({
    collectionID: String,
    collectionName: String,
    component: Number,
    data_type: String,
    defaultAggregation: String,
    description: String,
    elementID: String,
    elementLabel: String,
    elementName: String,
    elementRole: String,
    elementType: String,
    visible: Boolean,
});

const layerObjectSchema = layerElementSchema.clone();
layerObjectSchema.add({
    format: String,
    expression: String,
    isCustom: Boolean,
    viewExpression: String,
});
layerObjectSchema.add({
    elements: {
        type: [layerObjectSchema],
        default: undefined,
    }
});

const layerJoinSchema = new mongoose.Schema({
    joinID: String,
    joinType: String,
    sourceCollectionID: String,
    sourceCollectionName: String,
    sourceElementID: String,
    sourceElementName: String,
    targetCollectionID: String,
    targetCollectionName: String,
    targetElementID: String,
    targetElementName: String,
});

const layerCollectionSchema = new mongoose.Schema({
    collectionID: String,
    collectionLabel: String,
    collectionName: String,
    component: Number,
    elements: [layerElementSchema],
    folded: Boolean,
    isSQL: Boolean,
    left: Number,
    sqlQuery: String,
    top: Number,
    visible: Boolean,
});

const layerSchema = new mongoose.Schema({
    companyID: { type: String, required: false },
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, required: true },
    params: {
        joins: [layerJoinSchema],
        schema: [layerCollectionSchema],
    },
    objects: [layerObjectSchema],
    nd_trash_deleted: { type: Boolean },
    nd_trash_deleted_date: { type: Date },
    createdBy: { type: String },
    createdOn: { type: Date },
    datasourceID: { type: mongoose.Schema.Types.ObjectId, required: true },
}, { collation: { locale: 'en', strength: 2 } });

module.exports = mongoose.model('Layer', layerSchema);
