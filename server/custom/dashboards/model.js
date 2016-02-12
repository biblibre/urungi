var mongoose = require('mongoose');

var DashboardsSchema = new mongoose.Schema({
    companyID: {type: String , required: true},
    dashboardName: {type: String, required: true},
    dashboardDescription: {type: String},
    dashboardType: {type: String},
    items: [],
    backgroundColor: {type: String},
    properties: {type: Object},
    history: [],
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date},
    owner: {type: String},
    parentFolder: {type: String},
    isPublic:{type: Boolean},
    createdBy: {type: String},
    createdOn: {type: Date}
}, { collection: 'wst_Dashboards' });

var Dashboards = connection.model('Dashboards', DashboardsSchema);
module.exports = Dashboards;
