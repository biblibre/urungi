/* global moment: false */

angular.module('app').controller('homeCtrl', ['$scope', '$rootScope', '$sessionStorage', 'connection', 'gettextCatalog', 'usersModel', function ($scope, $rootScope, $sessionStorage, connection, gettextCatalog, usersModel) {
    $scope.dashboardsNbr = 3;
    $scope.reportsNbr = 10;
    $scope.notificationsNbr = 0;
    $scope.alertsNbr = 0;
    $scope.subPage = 'js/report/list.html';

    function getIntraOptions () {
        if ($rootScope.isWSTADMIN) {
            $scope.IntroOptions = {
            // IF width > 300 then you will face problems with mobile devices in responsive mode
                steps: [
                    {
                        element: '#mainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('The main menu') +
                        '</h3><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Here you can access the basic operations in urungi') +
                        '</span><br/><span>' +
                        gettextCatalog.getString('The "white" part of the menu is common for all users, the "green" part is only for urungi administrators') +
                        '</span></div>',
                        width: '300px',
                        height: '180px'
                    },
                    {
                        element: '#publicArea',
                        html: '<div><h3>' +
                        gettextCatalog.getString('The public area') +
                        '</h3><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Here all the public shared elements (reports, dashboards, pages) are displayed to be accesed by the users') +
                        '</span><br/><span>' +
                        gettextCatalog.getString('Depending on their permissions the users can access different folders and/or elements') +
                        '</span></div>',
                        width: '300px',
                        height: '180px'

                    },
                    {
                        element: '#latestExecutions',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Latest executions') +
                        '</h3><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Here are displayed the 10 latest element executions by the connected user, along with the last execution time') +
                        '</span><br/><span></span></div>',
                        width: '300px',
                        height: '180px'
                    },
                    {
                        element: '#mostExecuted',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Most Executed') +
                        '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                        gettextCatalog.getString('This area display the 10 most executed elements for the hole company and the number of executions per element') +
                        '</span><br/><span></span></div>',
                        width: '300px',
                        height: '180px'
                    },
                    {
                        element: '#usersMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Users') +
                        '</h3><span style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is only available for urungi administrators.') +
                        '</span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Access users to create new urungi users and to manage them') +
                        '</span><br/><span></span></div>',
                        width: '300px',
                        height: '180px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#rolesMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Roles') +
                        '</h3><span style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is only available for urungi administrators.') +
                        '</span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Access roles to create, manage roles, and grant or revoque permissions') +
                        '</span><br/><span></span></div>',
                        width: '300px',
                        height: '180px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#datasourcesMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Data sources') +
                        '</h3><span style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is only available for urungi administrators.') +
                        '</span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Access here to define the connections to the different sources of your information') +
                        '</span><br/><span>' +
                        gettextCatalog.getString('You will define here your database connections to get the data used in the reports that will be created by the users') +
                        '</span></div>',
                        width: '300px',
                        height: '250px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#layersMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Layers') +
                        '</h3><span style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is only available for urungi administrators.') +
                        '</span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Here you can define the semantic layer used by your users to access the data in the different data sources.') +
                        '</span><br/><span>' +
                        gettextCatalog.getString('You will define here the labels to use for every field, the joins between the different entities (tables), etc... All the necessary stuff to allow your users to create a report without any knowlegde of the structure of your data') +
                        '</span></div>',
                        width: '300px',
                        height: '300px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#publicSpaceMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Public space') +
                        '</h3><span style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is only available for urungi administrators.') +
                        '</span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Define here the folder structure for the public area') +
                        '</span><br/><span></span></div>',
                        width: '300px',
                        height: '180px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#myProfileMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('My profile') +
                        '</h3><span style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is available for all users.') +
                        '</span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Access this to view info about your profile, change your password, etc...') +
                        '</span><br/><span></span></div>',
                        width: '300px',
                        height: '180px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#exploreMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Explore') +
                        '</h3><span style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is available for all users that have the grant for explore data.') +
                        '</span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Explore allow users to surf across the data without creating a report for that.') +
                        '</span><br/><span>' +
                        gettextCatalog.getString('Use this if you want to query your data but is not necessary for you to save it for a later use') +
                        '</span></div>',
                        width: '300px',
                        height: '200px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#pagesMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Page reports') +
                        '</h3><span style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is available for all users that have the grant to create pages.') +
                        '</span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Pages allow users to create and manage report pages.') +
                        '</span><br/><span>' +
                        gettextCatalog.getString('Report pages are webpages that can be compromised of data in the form of charts or data grids, along with other HTML elements that allows to customize the report at the highest level') +
                        '</span></div>',
                        width: '300px',
                        height: '250px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#reportsMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Single query reports') +
                        '</h3><span style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is available for all users that have the grant to create reports.') +
                        '</span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Reports allow users to create and manage single query reports.') +
                        '</span><br/><span>' +
                        gettextCatalog.getString('Single Reports allow the user to configure a query against the data and get the results using different charts or a data grid, single reports are the elements that you use to create a dashboard') +
                        '</span></div>',
                        width: '300px',
                        height: '250px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#dashboardsMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Single query dashboards') +
                        '</h3><span style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is available for all users that have the grant to create dashboards.') +
                        '</span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Dashboards allow users to create dashboards using single query reports.') +
                        '</span><br/><span>' +
                        gettextCatalog.getString('Dashboards allow the user to group several single query reports in just one interface, when creating dashboards you can define the area, size and position of every single query report into the dashboard') +
                        '</span></div>',
                        width: '300px',
                        height: '250px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#homeMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Home') +
                        '</h3><span style="font-weight:bold;color:#8DC63F">' +
                        gettextCatalog.getString('This link is available for all users.') +
                        '</span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Use this link to back to this page') +
                        '</span><br/><span></span></div>',
                        width: '300px',
                        height: '150px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#parentIntro',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Next Step') +
                        '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                        gettextCatalog.getString('Setup a data source') +
                        '</span><br/><br/><br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/data-sources#intro">' +
                        gettextCatalog.getString('Go to data sources and continue tour') +
                        '</a></span></div>',
                        width: '500px',
                        objectArea: false,
                        verticalAlign: 'top',
                        height: '250px'
                    }
                ]
            };
        } else {
            // the user is not WSTADMIN
            $scope.IntroOptions = {
            // IF width > 300 then you will face problems with mobile devices in responsive mode
                steps: [
                    {
                        element: '#mainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('The main menu') +
                        '</h3><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Here you can access the basic operations in urungi') +
                        '</span><br/><span></span></div>',
                        width: '300px',
                        height: '180px'
                    },
                    {
                        element: '#publicArea',
                        html: '<div><h3>' +
                        gettextCatalog.getString('The public area') +
                        '</h3><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Here all the public shared elements (reports, dashboards, pages) that you can execute') +
                        '</span><br/><span>' +
                        gettextCatalog.getString('Depending on your permissions you will be able to access different folders and/or elements') +
                        '</span></div>',
                        width: '300px',
                        height: '180px'

                    },
                    {
                        element: '#latestExecutions',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Latest executions') +
                        '</h3><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Here are displayed your 10 latest element executions, along with the last execution time') +
                        '</span><br/><span></span></div>',
                        width: '300px',
                        height: '180px'
                    },
                    {
                        element: '#mostExecuted',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Most Executed') +
                        '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                        gettextCatalog.getString('This area display your 10 most executed elements and the number of executions per element') +
                        '</span><br/><span></span></div>',
                        width: '300px',
                        height: '180px'
                    },
                    {
                        element: '#myProfileMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('My profile') +
                        '</h3><span style="font-weight:bold;color:#8DC63F"></span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Access this to view info about your profile, change your password, etc...') +
                        '</span><br/><span></span></div>',
                        width: '300px',
                        height: '180px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#exploreMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Explore') +
                        '</h3><span style="font-weight:bold;color:#8DC63F"></span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Explore allows you to surf across the data without creating a report for that.') +
                        '</span><br/><span>' +
                        gettextCatalog.getString('Use this if you want to query your data but is not necessary for you to save it for a later use') +
                        '</span></div>',
                        width: '300px',
                        height: '200px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#pagesMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Page reports') +
                        '</h3><span style="font-weight:bold;color:#8DC63F"></span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Pages allows you to create (if granted) and manage report pages.') +
                        '</span><br/><span>' +
                        gettextCatalog.getString('Report pages are webpages that can be compromised of data in the form of charts or data grids, along with other HTML elements that allows you to customize the report at the highest level') +
                        '</span></div>',
                        width: '300px',
                        height: '250px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#reportsMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Single query reports') +
                        '</h3><span style="font-weight:bold;color:#8DC63F"></span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Reports allows you to create (if granted) and manage your single query reports.') +
                        '</span><br/><span>' +
                        gettextCatalog.getString('Using single query reports you can configure a query against the data and get the results using different charts or a simple data grid.') +
                        '</span></div>',
                        width: '300px',
                        height: '250px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#dashboardsMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Single query dashboards') +
                        '</h3><span style="font-weight:bold;color:#8DC63F"></span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Dashboards allows you to create (if granted) and manage dashboards using your previous defined single query reports.') +
                        '</span><br/><span>' +
                        gettextCatalog.getString('Using single query dashboards you can group several single query reports in just one interface, you can define the area, size and position of every single query report into the dashboard') +
                        '</span></div>',
                        width: '300px',
                        height: '250px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#homeMainMenu',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Home') +
                        '</h3><span style="font-weight:bold;color:#8DC63F"></span><br/><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Use this link to back to this page') +
                        '</span><br/><span></span></div>',
                        width: '300px',
                        height: '150px',
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    }

                ]
            };

            if ($rootScope.user.exploreData) {
                $scope.IntroOptions.steps.push({
                    element: '#parentIntro',
                    html: '<div><h3>' +
                    gettextCatalog.getString('Next Step') +
                    '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                    gettextCatalog.getString('Explore data') +
                    '</span><br/><br/>' +
                    gettextCatalog.getString('See how you can explore data creating queries easily without any technical knowledge') +
                    '<br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/explore/intro">' +
                    gettextCatalog.getString('Go to data explorer and continue tour') +
                    '</a></span></div>',
                    width: '500px',
                    objectArea: false,
                    verticalAlign: 'top',
                    height: '250px'
                });
            } else {
                if ($rootScope.user.pagesCreate || $rootScope.counts.pages > 0) {
                    $scope.IntroOptions.steps.push({
                        element: '#parentIntro',
                        html: '<div><h3>' +
                        gettextCatalog.getString('Next Step') +
                        '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                        gettextCatalog.getString('Page reports') +
                        '</span><br/><br/>' +
                        gettextCatalog.getString('See how you can create customized web pages that shows your data using charts and data grids along with HTML components') +
                        '<br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/page/intro">' +
                        gettextCatalog.getString('Go to pages designer and continue tour') +
                        '</a></span></div>',
                        width: '500px',
                        objectArea: false,
                        verticalAlign: 'top',
                        height: '250px'
                    });
                } else {
                    if ($rootScope.user.reportsCreate || $rootScope.counts.reports > 0) {
                        $scope.IntroOptions.steps.push({
                            element: '#parentIntro',
                            html: '<div><h3>' +
                            gettextCatalog.getString('Next Step') +
                            '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                            gettextCatalog.getString('Single query reports') +
                            '</span><br/><br/>' +
                            gettextCatalog.getString('See how you can create single query reports that shows your data using charts and data grids') +
                            '<br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/report/intro">' +
                            gettextCatalog.getString('Go to single query report designer and continue tour') +
                            '</a></span></div>',
                            width: '500px',
                            objectArea: false,
                            verticalAlign: 'top',
                            height: '250px'
                        });
                    } else {
                        if ($rootScope.user.dashboardsCreate || $rootScope.counts.dashBoards > 0) {
                            $scope.IntroOptions.steps.push({
                                element: '#parentIntro',
                                html: '<div><h3>' +
                                gettextCatalog.getString('Next Step') +
                                '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                                gettextCatalog.getString('Dashboards') +
                                '</span><br/><br/>' +
                                gettextCatalog.getString('See how to create dashboards composed with a set of single query reports') +
                                '<br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/dashboard/intro">' +
                                gettextCatalog.getString('Go to dashboards and continue tour') +
                                '</a></span></div>',
                                width: '500px',
                                objectArea: false,
                                verticalAlign: 'top',
                                height: '250px'
                            });
                        }
                    }
                }
            }
        }
    }

    connection.get('/api/get-user-other-data', {}).then(function (data) {
        var user = data.items;
        $rootScope.user.contextHelp = user.contextHelp;
    });

    connection.get('/api/get-user-last-executions', {}).then(function (data) {
        $scope.lastExecutions = [];
        $scope.mostExecutions = [];

        for (var l in data.items.theLastExecutions) {
            if (l < 10) {
                data.items.theLastExecutions[l]._id['lastDate'] = moment(data.items.theLastExecutions[l].lastDate).fromNow();
                data.items.theLastExecutions[l]._id['relationedName'] = data.items.theLastExecutions[l]._id.relationedName;
                $scope.lastExecutions.push(data.items.theLastExecutions[l]._id);
            }
        }
        for (var m in data.items.theMostExecuted) {
            if (m < 10) {
                data.items.theMostExecuted[m]._id['count'] = data.items.theMostExecuted[m].count;
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
        /* connection.get('/api/get-counts', {}).then(function(data) {
            $rootScope.counts = data;
        }); */
    };

    $scope.refreshHome = function () {
        usersModel.getUserObjects().then(userObjects => {
            $scope.userObjects = userObjects;
        });

        connection.get('/api/get-counts', {}).then(function (data) {
            $rootScope.counts = data;
            getIntraOptions();
        });
    };
    $scope.refreshHome();
}]);
