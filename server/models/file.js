var mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
    companyID: { type: String, required: false },
    filename: { type: String, required: true }, // The name under which the file is stored in the system
    name: { type: String, required: false }, // The name seen by the user
    type: { type: String, required: true },
    url: { type: String },
    size: { type: Number },
    nd_trash_deleted: { type: Boolean },
    nd_trash_deleted_date: { type: Date },
    upload_user_id: { type: String },
    createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);
