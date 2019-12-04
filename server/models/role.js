const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
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

roleSchema.methods.canShareReportsInFolder = function (folderId) {
    const grant = this.grants.find(grant => grant.folderID === folderId);
    if (grant) {
        return grant.shareReports;
    }

    return false;
};

roleSchema.methods.canExecuteReportsInFolder = function (folderId) {
    const grant = this.grants.find(grant => grant.folderID === folderId);
    if (grant) {
        return grant.executeReports;
    }

    return false;
};

roleSchema.methods.canExecuteDashboardsInFolder = function (folderId) {
    const grant = this.grants.find(grant => grant.folderID === folderId);
    if (grant) {
        return grant.executeDashboards;
    }

    return false;
};

module.exports = mongoose.model('Role', roleSchema);
