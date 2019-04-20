var mongoose = require('mongoose');

const LayerElementSchema = new mongoose.Schema({
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

const LayerAssociatedElementSchema = new mongoose.Schema({
    element: LayerElementSchema,
    visible: Boolean,
});

const LayerObjectSchema = LayerElementSchema.clone();
LayerObjectSchema.add({
    associatedElements: {
        type: [ LayerAssociatedElementSchema ],
        default: undefined,
    },
    format: String,
    expression: String,
    isCustom: Boolean,
    viewExpression: String,
});
LayerObjectSchema.add({
    elements: {
        type: [ LayerObjectSchema ],
        default: undefined,
    }
});

const LayerJoinSchema = new mongoose.Schema({
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

const LayerCollectionSchema = new mongoose.Schema({
    collectionID: String,
    collectionLabel: String,
    collectionName: String,
    component: Number,
    elements: [ LayerElementSchema ],
    folded: Boolean,
    isSQL: Boolean,
    left: Number,
    sqlQuery: String,
    top: Number,
    visible: Boolean,
});

var LayersSchema = new mongoose.Schema({
    companyID: { type: String, required: false },
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, required: true },
    params: {
        joins: [ LayerJoinSchema ],
        schema: [ LayerCollectionSchema ],
    },
    objects: [ LayerObjectSchema ],
    nd_trash_deleted: { type: Boolean },
    nd_trash_deleted_date: { type: Date },
    createdBy: { type: String },
    createdOn: { type: Date },
    datasourceID: { type: mongoose.Schema.Types.ObjectId, required: true },
}, { collection: 'wst_Layers', collation: { locale: 'en', strength: 2 } });

LayersSchema.statics.setStatus = function (req, done) {
    if (req.session.isWSTADMIN) {
        var layerID = req.body.layerID;
        var layerStatus = req.body.status;

        if (!layerID || typeof layerID === 'undefined') {
            done({ result: 0, msg: "'id' and 'status' are required." });
            return;
        }
        this.findOne({ '_id': layerID, 'companyID': req.user.companyID }, function (err, findLayer) {
            if (err) { console.error(err); }

            if (findLayer) {
                Layers.updateOne({
                    '_id': layerID
                }, {
                    $set: {
                        'status': layerStatus
                    }
                }, function (err, numAffected) {
                    if (err) throw err;

                    done({ result: 1, msg: 'Status updated.' });
                });
            } else {
                done({ result: 0, msg: 'No layer found for this company, can´t update the layer status' });
            }
        });
    }
};

var Layers = connection.model('Layers', LayersSchema);
module.exports = Layers;
