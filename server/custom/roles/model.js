var mongoose = require('mongoose');


var RolesSchema = new mongoose.Schema({
    companyID: {type: String, required: false},
    name: {type: String, required: true},
    description: {type: String},
    permissions: [],
    grants: [],
    reportsCreate: {type: Boolean},
    pagesCreate: {type: Boolean},
    reportsPublish: {type: Boolean},
    dashboardsCreate: {type: Boolean},
    exploreData: {type: Boolean},
    viewSQL: {type: Boolean},
    dashboardsPublish: {type: Boolean},
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date},
    createdBy: {type: String},
    createdOn: {type: Date}
}, { collection: 'wst_Roles' });

var Roles = connection.model('Roles', RolesSchema);
module.exports = Roles;
