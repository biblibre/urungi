app.service('dashboardModel',  function ($http, $q, connection, promptModel) {


    this.getDashBoard = function(dashboardID, done)
    {
        connection.get('/api/dashboards/get/'+dashboardID, {id: dashboardID}, function(data) {
            done(data.item);
        });
    }

    this.getPromptsForDashboard = function($scope,dashboard, done)
    {
        getDashboardPrompts($scope, dashboard,0,[],function(prompts){
            done(prompts);
        })

    }

    function getDashboardPrompts($scope,dashboard,index,prompts, done)
    {
        if (!dashboard.items[index])
        {
            done(prompts);
            return;
        }

        if (!prompts)
            prompts = [];


        //console.log('processing prompts for report '+dashboard.items[index].reportID);

        if (dashboard.items[index].itemType == 'reportBlock')
        {
            promptModel.getPrompts($scope,dashboard.items[index].reportDefinition, function(){
                getDashboardPrompts($scope,dashboard,index+1,prompts, done);
            });
        }  else {
            getDashboardPrompts($scope,dashboard,index+1,prompts,done);
        }

    }

});
