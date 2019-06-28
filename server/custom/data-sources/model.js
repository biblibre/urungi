var mongoose = require('mongoose');

var DataSourcesSchema = new mongoose.Schema({
    companyID: { type: String, required: false },
    name: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: Number, required: true }, // -1 error, 0 not active, 1 active
    connection: { type: Object },
    packetSize: { type: Number },
    nd_trash_deleted: { type: Boolean },
    nd_trash_deleted_date: { type: Date },
    createdBy: { type: String },
    createdOn: { type: Date },
    statusInfo: { type: Object }
}, { collection: 'wst_DataSources' });

DataSourcesSchema.statics.changeStatus = function (req, datasourceID, status, done) {
// -1 error, 0 not active, 1 active

    DataSources.updateOne({ _id: datasourceID }, { $set: { status: status } }, function (err, result) {
        if (err) throw err;
        var numAffected = (typeof result.n === 'undefined') ? result.nModified : result.n; // MongoDB 2.X return n, 3.X return nModified?
        if (numAffected > 0) {
            done({ result: 1, msg: numAffected + ' datasource updated.' });
        } else {
            done({ result: 0, msg: 'Error updating datasource, no record have been updated for datasource: ' + datasourceID });
        }
    });
};

DataSourcesSchema.statics.setStatusInfo = function (req, datasourceID, status, done) {
// -1 error, 0 not active, 1 active

    DataSources.updateOne({ _id: datasourceID }, { $set: { status: status } }, function (err, result) {
        if (err) throw err;
        var numAffected = (typeof result.n === 'undefined') ? result.nModified : result.n; // MongoDB 2.X return n, 3.X return nModified?
        if (numAffected > 0) {
            done({ result: 1, msg: numAffected + ' record updated.' });
        } else {
            done({ result: 0, msg: 'Error updating record, no record have been updated for datasource: ' + datasourceID });
        }
    });
};

DataSourcesSchema.statics.invalidateDatasource = function (req, datasourceID, errorcode, actioncode, msg, done) {
    // Change the status of the datasource to -1
    // Search for all layers that uses the datasource and change the status to -1 (temporay unavailable)
    // For every layer search for every repors that use the layer and change the status to -1 (temporary unavailable)
    // For every layer search for every dashboard that has reports that uses the layer and change the status of the dashboard to -1 (temporary unavailable)
    // theDataSource.status = -1;
    // theDatasource.statusInfo = {errorCode:data.code,actionCode:data.actionCode,message:data.msg,lastDate:new Date()}

    // DataSources.changeStatus(req,datasourceID,-1,function(result){
    // console.log('change status',result);

    var statusInfo = { type: 'ALERT', errorCode: errorcode, actionCode: actioncode, message: msg, lastDate: new Date() };
    // });

    DataSources.updateOne({ _id: datasourceID }, { $set: { status: -1, statusInfo: statusInfo } }, function (err, result) {
        if (err) throw err;
        var numAffected = (typeof result.n === 'undefined') ? result.nModified : result.n; // MongoDB 2.X return n, 3.X return nModified?
        if (numAffected > 0) {
            done({ result: 1, msg: numAffected + ' record updated.' });
        } else {
            done({ result: 0, msg: 'Error updating record, no record have been updated for datasource: ' + datasourceID });
        }
    });
};

var DataSources = connection.model('DataSources', DataSourcesSchema);
module.exports = DataSources;
