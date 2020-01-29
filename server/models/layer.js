var mongoose = require('mongoose');

const layerElementSchema = new mongoose.Schema({
    collectionID: String,
    collectionName: String,
    component: Number,
    defaultAggregation: String,
    description: String,
    elementID: String,
    elementLabel: String,
    elementName: String,
    elementRole: String,
    elementType: String,
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
});

const layerSchema = new mongoose.Schema({
    datasourceID: { type: mongoose.Schema.Types.ObjectId, required: true },
    description: { type: String },
    name: { type: String, required: true },
    objects: [layerObjectSchema],
    params: {
        joins: [layerJoinSchema],
        schema: [layerCollectionSchema],
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'Not active'],
    },
}, { collation: { locale: 'en', strength: 2 } });

layerSchema.methods.findObject = function (id) {
    function search (objs, id) {
        for (const obj of objs) {
            if (obj.elementID === id) {
                return obj;
            }
            if (obj.elements) {
                const found = search(obj.elements, id);
                if (found) {
                    return found;
                }
            }
        }
    }

    return search(this.objects, id);
};

module.exports = mongoose.model('Layer', layerSchema);
