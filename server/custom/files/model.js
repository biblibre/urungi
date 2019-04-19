var mongoose = require('mongoose');

var FilesSchema = new mongoose.Schema({
    companyID: { type: String, required: false },
    filename: { type: String, required: true }, // The name under which the file is stored in the system
    name: { type: String, required: false }, // The name seen by the user
    type: { type: String, required: true },
    url: { type: String },
    size: { type: Number },
    nd_trash_deleted: { type: Boolean },
    nd_trash_deleted_date: { type: Date },
    upload_user_id: { type: String },
    createdOn: { type: Date }
}, { collection: 'wst_Files' });

var Files = connection.model('Files', FilesSchema);
module.exports = Files;
