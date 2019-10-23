angular.module('app').controller('homeCtrl', ['$scope', '$rootScope', '$q', 'moment', 'connection', 'gettextCatalog', 'userService', 'api', function ($scope, $rootScope, $q, moment, connection, gettextCatalog, userService, api) {
    $scope.dashboardsNbr = 3;
    $scope.reportsNbr = 10;
    $scope.notificationsNbr = 0;
    $scope.alertsNbr = 0;
    $scope.subPage = 'js/report/list.html';

    function getIntraOptions () {
        $q.all({ user: userService.getCurrentUser(), counts: api.getCounts() }).then(result => {
            const { user, counts } = result;
            $scope.IntroOptions = {
                nextLabel: gettextCatalog.getString('Next'),
                prevLabel: gettextCatalog.getString('Back'),
                skipLabel: gettextCatalog.getString('Skip'),
                doneLabel: gettextCatalog.getString('Done'),
                tooltipPosition: 'auto',
                showStepNumbers: false,
                steps: [
                    {
                        element: '#mainMenu',
                        intro: '<h4>' +
                            gettextCatalog.getString('The main menu') +
                            '</h4><p>' +
                            gettextCatalog.getString('Here you can access the basic operations in urungi') +
                            '</p>',
                    },
                    {
                        element: '#sharedArea',
                        intro: '<h4>' +
                            gettextCatalog.getString('The shared area') +
                            '</h4><p>' +
                            gettextCatalog.getString('Here all the shared shared elements (reports, dashboards) that you can execute') +
                            '</p><p>' +
                            gettextCatalog.getString('Depending on your permissions you will be able to access different folders and/or elements') +
                            '</p>',
                    },
                    {
                        element: '#latestExecutions',
                        intro: '<h4>' +
                            gettextCatalog.getString('Latest executions') +
                            '</h4><p>' +
                            gettextCatalog.getString('Here are displayed your 10 latest element executions, along with the last execution time') +
                            '</p>',
                    },
                    {
                        element: '#mostExecuted',
                        intro: '<h4>' +
                            gettextCatalog.getString('Most Executed') +
                            '</h4><p>' +
                            gettextCatalog.getString('This area display your 10 most executed elements and the number of executions per element') +
                            '</p>',
                    },
                    {
                        element: '#exploreMainMenu',
                        intro: '<h4>' +
                            gettextCatalog.getString('Explore') +
                            '</h4><p>' +
                            gettextCatalog.getString('Explore allows you to surf across the data without creating a report for that.') +
                            '</p><p>' +
                            gettextCatalog.getString('Use this if you want to query your data but is not necessary for you to save it for a later use') +
                            '</p>',
                    },
                    {
                        element: '#reportsMainMenu',
                        intro: '<h4>' +
                            gettextCatalog.getString('Single query reports') +
                            '</h4><p>' +
                            gettextCatalog.getString('Reports allows you to create (if granted) and manage your single query reports.') +
                            '</p><p>' +
                            gettextCatalog.getString('Using single query reports you can configure a query against the data and get the results using different charts or a simple data grid.') +
                            '</p>',
                    },
                    {
                        element: '#dashboardsMainMenu',
                        intro: '<h4>' +
                            gettextCatalog.getString('Single query dashboards') +
                            '</h4><p>' +
                            gettextCatalog.getString('Dashboards allows you to create (if granted) and manage dashboards using your previous defined single query reports.') +
                            '</p><p>' +
                            gettextCatalog.getString('Using single query dashboards you can group several single query reports in just one interface, you can define the area, size and position of every single query report into the dashboard') +
                            '</p>',
                    },
                    {
                        element: '#homeMainMenu',
                        intro: '<h4>' +
                            gettextCatalog.getString('Home') +
                            '</h4><p>' +
                            gettextCatalog.getString('Use this link to back to this page') +
                            '</p>',
                    }
                ]
            };

            if (user.isAdmin()) {
                $scope.IntroOptions.steps.push({
                    element: '#usersMainMenu',
                    intro: '<h4>' +
                        gettextCatalog.getString('Users') +
                        '</h4><p style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is only available for urungi administrators.') +
                        '</p><p>' +
                        gettextCatalog.getString('Access users to create new urungi users and to manage them') +
                        '</p>',
                });
                $scope.IntroOptions.steps.push({
                    element: '#rolesMainMenu',
                    intro: '<h4>' +
                        gettextCatalog.getString('Roles') +
                        '</h4><p style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is only available for urungi administrators.') +
                        '</p><p>' +
                        gettextCatalog.getString('Access roles to create, manage roles, and grant or revoque permissions') +
                        '</p>',
                });
                $scope.IntroOptions.steps.push({
                    element: '#datasourcesMainMenu',
                    intro: '<h4>' +
                        gettextCatalog.getString('Data sources') +
                        '</h4><p style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is only available for urungi administrators.') +
                        '</p><p>' +
                        gettextCatalog.getString('Access here to define the connections to the different sources of your information') +
                        '</p><p>' +
                        gettextCatalog.getString('You will define here your database connections to get the data used in the reports that will be created by the users') +
                        '</p>',
                });
                $scope.IntroOptions.steps.push({
                    element: '#layersMainMenu',
                    intro: '<h4>' +
                        gettextCatalog.getString('Layers') +
                        '</h4><p style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is only available for urungi administrators.') +
                        '</p><p>' +
                        gettextCatalog.getString('Here you can define the semantic layer used by your users to access the data in the different data sources.') +
                        '</p><p>' +
                        gettextCatalog.getString('You will define here the labels to use for every field, the joins between the different entities (tables), etc... All the necessary stuff to allow your users to create a report without any knowledge of the structure of your data') +
                        '</p>',
                });
                $scope.IntroOptions.steps.push({
                    element: '#sharedSpaceMainMenu',
                    intro: '<h4>' +
                        gettextCatalog.getString('Shared space') +
                        '</h4><p style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is only available for urungi administrators.') +
                        '</p><p>' +
                        gettextCatalog.getString('Define here the folder structure for the shared area') +
                        '</p>',
                });
                $scope.IntroOptions.steps.push({
                    intro: '<h4>' +
                        gettextCatalog.getString('Next Step') +
                        '</h4><p>' +
                        gettextCatalog.getString('Setup a data source') +
                        '</p><a class="btn btn-info btn-xs" href="data-sources#intro">' +
                        gettextCatalog.getString('Go to data sources and continue tour') +
                        '</a>',
                });
            } else {
                // the user is not admin
                if (user.exploreData) {
                    $scope.IntroOptions.steps.push({
                        intro: '<h4>' +
                            gettextCatalog.getString('Next Step') +
                            '</h4><p>' +
                            gettextCatalog.getString('Explore data') +
                            '</p><p>' +
                            gettextCatalog.getString('See how you can explore data creating queries easily without any technical knowledge') +
                            '</p><a class="btn btn-info btn-xs" href="explore#intro">' +
                            gettextCatalog.getString('Go to data explorer and continue tour') +
                            '</a>',
                    });
                } else if (user.reportsCreate || counts.reports > 0) {
                    $scope.IntroOptions.steps.push({
                        intro: '<h4>' +
                            gettextCatalog.getString('Next Step') +
                            '</h4><p>' +
                            gettextCatalog.getString('Single query reports') +
                            '</p><p>' +
                            gettextCatalog.getString('See how you can create single query reports that shows your data using charts and data grids') +
                            '</p><a class="btn btn-info btn-xs" href="report#intro">' +
                            gettextCatalog.getString('Go to single query report designer and continue tour') +
                            '</a>',
                    });
                } else if (user.dashboardsCreate || counts.dashBoards > 0) {
                    $scope.IntroOptions.steps.push({
                        intro: '<h4>' +
                            gettextCatalog.getString('Next Step') +
                            '</h4><p>' +
                            gettextCatalog.getString('Dashboards') +
                            '</p><p>' +
                            gettextCatalog.getString('See how to create dashboards composed with a set of single query reports') +
                            '</p><a class="btn btn-info btn-xs" href="dashboard#intro">' +
                            gettextCatalog.getString('Go to dashboards and continue tour') +
                            '</a>',
                    });
                }
            }
        });
    }

    connection.get('/api/get-user-last-executions', {}).then(function (data) {
        $scope.lastExecutions = [];
        $scope.mostExecutions = [];

        for (var l in data.items.theLastExecutions) {
            if (l < 10) {
                data.items.theLastExecutions[l]._id.lastDate = moment(data.items.theLastExecutions[l].lastDate).fromNow();
                $scope.lastExecutions.push(data.items.theLastExecutions[l]._id);
            }
        }
        for (var m in data.items.theMostExecuted) {
            if (m < 10) {
                data.items.theMostExecuted[m]._id.count = data.items.theMostExecuted[m].count;
                $scope.mostExecutions.push(data.items.theMostExecuted[m]._id);
            }
        }
    });

    $scope.getReports = function (params) {
        params = params || {};

        connection.get('/api/reports/find-all', params).then(function (data) {
            $scope.reports = data;
        });
    };

    $scope.getDashboards = function (params) {
        params = params || {};

        connection.get('/api/dashboards/find-all', params).then(function (data) {
            $scope.dashboards = data;
        });
    };

    $scope.getCounts = function () {
    };

    $scope.setUserContextHelpViewed = function (contextHelpName) {
        var params = {};
        params.contextHelpName = contextHelpName;
        connection.get('/api/set-viewed-context-help', params).then(function (data) {
            $rootScope.userContextHelp = data.items;
        });
    };

    $scope.refreshHome = function () {
        api.getUserObjects().then(userObjects => {
            $scope.userObjects = userObjects;
        });

        getIntraOptions();
    };
    $scope.refreshHome();
}]);
