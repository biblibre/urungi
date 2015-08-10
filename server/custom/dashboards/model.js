var mongoose = require('mongoose');

var DashboardsSchema = new mongoose.Schema({
    companyID: {type: String},
    dashboardName: {type: String, required: true},
    dashboardDescription: {type: String},
    items: [],
    backgroundColor: {type: String},
    properties: {type: Object},
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date}
}, { collection: config.app.customCollectionsPrefix+'Dashboards' });

var Dashboards = connection.model('Dashboards', DashboardsSchema);
module.exports = Dashboards;
