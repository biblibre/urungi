/* global uuid2: false */

app.service('dashboardv2Model', function ($http, $q, connection, reportService) {
    this.getDashBoard = function (dashboardID, isLinked, done) {
        connection.get('/api/dashboardsv2/get/' + dashboardID, {id: dashboardID, linked: isLinked}, function (data) {
            done(data.item);
        });
    };

    this.getDashboards = function (params, done) {
        params = params || {};
        connection.get('/api/dashboardsv2/find-all', params, function (data) {
            done(data);
        });
    };

    this.getPromptsForDashboard = function ($scope, dashboard, done) {
        getDashboardPrompts($scope, dashboard, 0, [], function (prompts) {
            done(prompts);
        });
    };

    function getDashboardPrompts ($scope, dashboard, index, prompts, done) {
    /*    if (!dashboard.items[index])
        {
            done(prompts);
            return;
        }

        if (!prompts)
            prompts = [];

        if (dashboard.items[index].itemType == 'reportBlock')
        {
            promptModel.getPrompts($scope,dashboard.items[index].reportDefinition, function(){
                getDashboardPrompts($scope,dashboard,index+1,prompts, done);
            });
        }  else {
            getDashboardPrompts($scope,dashboard,index+1,prompts,done);
        }
*/
    }

    this.pushReport2Dashboard = function (dashboardID) {
        connection.get('/api/dashboardsv2/get/' + dashboardID, {id: dashboardID, linked: false}, function (data) {
            var selectedDashboard = data.item;
            var qstructure = reportService.getReport();
            qstructure.reportName = 'report_' + (selectedDashboard.reports.length + 1);
            qstructure.id = uuid2.newguid();
            selectedDashboard.reports.push(qstructure);
        });
    };

    this.duplicateDashboard = async function (duplicateOptions) {
        const params = { id: duplicateOptions.dashboard._id };
        var newDashboard = (await connection.get('/api/dashboardsv2/find-one', params)).item;

        delete newDashboard._id;
        newDashboard.dashboardName = duplicateOptions.newName;

        const data = await connection.post('/api/dashboardsv2/create', newDashboard);
        if (data.result === 1) {

        } else {
            // TODO indicate error
        }
    };
});
