angular.module('app').service('dashboardv2Model', function (connection) {
    this.duplicateDashboard = function (duplicateOptions) {
        const params = { id: duplicateOptions.dashboard._id };

        return connection.get('/api/dashboardsv2/find-one', params).then(function (result) {
            const newDashboard = result.item;

            delete newDashboard._id;
            delete newDashboard.createdOn;
            newDashboard.dashboardName = duplicateOptions.newName;

            return connection.post('/api/dashboardsv2/create', newDashboard);
        });
    };
});
