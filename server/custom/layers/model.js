var mongoose = require('mongoose');


var LayersSchema = new mongoose.Schema({
    companyID: {type: String, required: false},
    name: {type: String, required: true},
    description: {type: String},
    status: {type: Number, required: true},
    params:  {type: Object},
    objects: [],
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date}
}, { collection: config.app.customCollectionsPrefix+'Layers' });

var Layers = connection.model('Layers', LayersSchema);
module.exports = Layers;