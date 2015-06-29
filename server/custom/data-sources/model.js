var mongoose = require('mongoose');


var DataSourcesSchema = new mongoose.Schema({
    companyID: {type: String, required: false},
    name: {type: String, required: true},
    type: {type: String, required: true},
    status: {type: Number, required: true},
    params: [],
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date}
}, { collection: config.app.customCollectionsPrefix+'DataSources' });

var DataSources = connection.model('DataSources', DataSourcesSchema);
module.exports = DataSources;