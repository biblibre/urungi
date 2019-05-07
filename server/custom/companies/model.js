var mongoose = require('mongoose');

var CompaniesSchema = new mongoose.Schema({
    companyID: { type: String, required: true },
    sharedSpace: [],
    defaultDocument: { type: String },
    defaultDocumentType: { type: String },
    customCSS: { type: String },
    customLogo: { type: String },
    history: [],
    nd_trash_deleted: { type: Boolean },
    nd_trash_deleted_date: { type: Date },
    createdBy: { type: String },
    createdOn: { type: Date }
}, { collection: 'wst_Companies' });

var Companies = connection.model('Companies', CompaniesSchema);
module.exports = Companies;
