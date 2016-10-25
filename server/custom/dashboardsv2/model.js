var mongoose = require('mongoose');

var Dashboardsv2Schema = new mongoose.Schema({
    companyID: {type: String , required: true},
    dashboardName: {type: String, required: true},
    dashboardDescription: {type: String},
    dashboardType: {type: String},
    html: {type: String},
    reports: [],
    items: [],
    backgroundColor: {type: String},
    backgroundImage: {type: String},
    properties: {type: Object},
    history: [],
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date},
    owner: {type: String},
    parentFolder: {type: String},
    isPublic:{type: Boolean},
    createdBy: {type: String},
    createdOn: {type: Date}
}, { collection: 'wst_Dashboardsv2' });

var Dashboardsv2 = connection.model('Dashboardsv2', Dashboardsv2Schema);
module.exports = Dashboardsv2;
