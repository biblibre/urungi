var mongoose = require('mongoose');

var RolesSchema = new mongoose.Schema({
    companyID: { type: String, required: false },
    name: { type: String, required: true },
    description: { type: String },
    permissions: [],
    grants: [],
    reportsCreate: { type: Boolean },
    reportsShare: { type: Boolean },
    dashboardsCreate: { type: Boolean },
    exploreData: { type: Boolean },
    viewSQL: { type: Boolean },
    dashboardsShare: { type: Boolean },
    nd_trash_deleted: { type: Boolean },
    nd_trash_deleted_date: { type: Date },
    createdBy: { type: String },
    createdOn: { type: Date }
});

var Roles = mongoose.model('Roles', RolesSchema, 'wst_Roles');
module.exports = Roles;
