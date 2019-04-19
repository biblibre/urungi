var mongoose = require('mongoose');

var PagesSchema = new mongoose.Schema({
    companyID: { type: String, required: true },
    pageName: { type: String, required: true },
    pageDescription: { type: String },
    pageType: { type: String },
    html: { type: String },
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
    createdBy: { type: String },
    createdOn: { type: Date }
}, { collection: 'wst_Pages' });

var Pages = connection.model('Pages', PagesSchema);
module.exports = Pages;
