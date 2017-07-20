
'use strict';

var app = angular.module('WideStage', [
        'ngRoute','ui.sortable','gridster','ui.layout', 'draganddrop', 'ui.bootstrap', 'ngCsvImport', 'checklist-model', 'ng-nestable',
        'infinite-scroll','angular-canv-gauge','ui.bootstrap-slider', 'widestage.directives','ngSanitize', 'ui.select','tg.dynamicDirective','angularUUID2','vs-repeat',
        'ui.bootstrap.datetimepicker','ui.tree','page.block','gridshore.c3js.chart','vAccordion','bsLoadingOverlay','gg.editableText'
    ,'intro.help','ngTagsInput','ui.codemirror','720kb.socialshare','ngFileUpload','pascalprecht.translate','colorpicker.module','angularSpectrumColorpicker','wst.inspector'
    ])
    .config(['$routeProvider','$translateProvider', function($routeProvider,$translateProvider) {

        //$translateProvider.useUrlLoader('./translations.json');
        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('escaped');

        $routeProvider.otherwise({redirectTo: '/home'});

        $routeProvider.when('/home', {
            templateUrl: 'partials/home/index.html',
            controller: 'homeCtrl'
        });
        $routeProvider.when('/dashboards', {
            templateUrl: 'partials/dashboard/list.html',
            controller: 'dashBoardCtrl'
        });
        $routeProvider.when('/dashboard/:extra', {
            templateUrl: 'partials/dashboard/list.html',
            controller: 'dashBoardCtrl'
        });

        $routeProvider.when('/dashboards/:dashboardID', {
            templateUrl: 'partials/dashboard/view.html',
            controller: 'dashBoardCtrl'
        });

        $routeProvider.when('/dashboards/:dashboardID/:elementID/:elementValue', {
            templateUrl: 'partials/dashboard/view.html',
            controller: 'dashBoardCtrl'
        });

        $routeProvider.when('/dashboards/new/:newDashboard/', {
            templateUrl: 'partials/dashboard/edit.html',
            controller: 'dashBoardCtrl'
        });
        $routeProvider.when('/dashboards/edit/:dashboardID/', {
            templateUrl: 'partials/dashboard/edit.html',
            controller: 'dashBoardCtrl'
        });

        //dashboards v2

         $routeProvider.when('/dashboardv2', {
            templateUrl: 'partials/dashboardv2/list.html',
            controller: 'dashBoardv2Ctrl'
        });
        $routeProvider.when('/dashboardv2/:extra', {
            templateUrl: 'partials/dashboardv2/list.html',
            controller: 'dashBoardv2Ctrl'
        });

        $routeProvider.when('/dashboardsv2/:dashboardID', {
            templateUrl: 'partials/dashboardv2/view.html',
            controller: 'dashBoardv2Ctrl'
        });

        $routeProvider.when('/dashboardsv2/:dashboardID/:elementID/:elementValue', {
            templateUrl: 'partials/dashboardv2/view.html',
            controller: 'dashBoardv2Ctrl'
        });

        $routeProvider.when('/dashboardsv2/new/:newDashboard/', {
            templateUrl: 'partials/dashboardv2/edit.html',
            controller: 'dashBoardv2Ctrl'
        });
        /*$routeProvider.when('/dashboardsv2/edit/:dashboardID/', {
            templateUrl: 'partials/dashboardv2/edit.html',
            controller: 'dashBoardv2Ctrl'
        });*/
        $routeProvider.when('/dashboardsv2/:mode/:dashboardID/', {
            templateUrl: 'partials/dashboardv2/edit.html',
            controller: 'dashBoardv2Ctrl'
        });

        //reports

        $routeProvider.when('/reports', {
            templateUrl: 'partials/report/list.html',
            controller: 'report_v2Ctrl'
        });
        $routeProvider.when('/report/:extra', {
            templateUrl: 'partials/report/list.html',
            controller: 'report_v2Ctrl'
        });

        $routeProvider.when('/reports/:reportID/', {
            templateUrl: 'partials/report-view/view.html',
            controller: 'report_viewCtrl'
        });

        $routeProvider.when('/reports/:reportID/:elementID/:elementValue', {
            templateUrl: 'partials/report/view.html',
            controller: 'report_v2Ctrl'
        });

        $routeProvider.when('/reports/new/:reportID/', {
            /*templateUrl: 'partials/report/edit.html',
            controller: 'reportCtrl'*/
            templateUrl: 'partials/report_v2/edit.html',
            controller: 'report_v2Ctrl'
        });
        $routeProvider.when('/reports/edit/:reportID/', {
            /*templateUrl: 'partials/report/edit.html',
            controller: 'reportCtrl'*/
            templateUrl: 'partials/report_v2/edit.html',
            controller: 'report_v2Ctrl'
        });
        //Data sources

        $routeProvider.when('/data-sources', {
            templateUrl: 'partials/data-source/list.html',
            controller: 'dataSourceCtrl'
        });

        $routeProvider.when('/datasources/:extra', {
            templateUrl: 'partials/data-source/list.html',
            controller: 'dataSourceCtrl'
        });

        $routeProvider.when('/data-sources/:dataSourceID/', {
            templateUrl: 'partials/data-source/edit.html',
            controller: 'dataSourceCtrl'
        });

        $routeProvider.when('/data-sources/edit/:dataSourceID/', {
            templateUrl: 'partials/data-source/edit.html',
            controller: 'dataSourceCtrl'
        });

        $routeProvider.when('/data_sources/new/:newDataSource/', {
            templateUrl: 'partials/data-source/edit.html',
            controller: 'dataSourceCtrl'
        });

        $routeProvider.when('/datasources/new/:newDataSource/:extra', {
            templateUrl: 'partials/data-source/edit.html',
            controller: 'dataSourceCtrl'
        });

        //layers

        $routeProvider.when('/layers', {
            templateUrl: 'partials/layer/list.html',
            controller: 'layerCtrl'
        });

        $routeProvider.when('/layer/:extra', {
            templateUrl: 'partials/layer/list.html',
            controller: 'layerCtrl'
        });

        $routeProvider.when('/layers/:layerID/', {
            templateUrl: 'partials/layer/view.html',
            controller: 'layerCtrl'
        });

        $routeProvider.when('/layer/edit/:layerID/', {
            templateUrl: 'partials/layer/edit.html',
            controller: 'layerCtrl'
        });

        //users

        $routeProvider.when('/users', {
            templateUrl: 'partials/users/list.html',
            controller: 'AdminUsersCtrl'
        });

        $routeProvider.when('/users/:userID/', {
            templateUrl: 'partials/users/view.html',
            controller: 'AdminUsersCtrl'
        });

        $routeProvider.when('/users/new/:newUser/', {
            templateUrl: 'partials/users/edit.html',
            controller: 'AdminUsersCtrl'
        });

        $routeProvider.when('/users/edit/:userID/', {
            templateUrl: 'partials/users/edit.html',
            controller: 'AdminUsersCtrl'
        });
        //roles
        $routeProvider.when('/roles', {
            templateUrl: 'partials/roles/list.html',
            controller: 'rolesCtrl'
        });

        $routeProvider.when('/roles/:roleID/', {
            templateUrl: 'partials/roles/view.html',
            controller: 'rolesCtrl'
        });

        $routeProvider.when('/roles/new/:newRole/', {
            templateUrl: 'partials/roles/editNew.html',
            controller: 'rolesCtrl'
        });
        $routeProvider.when('/logout', {
            templateUrl: 'partials/logout/index.html',
            controller: 'logOutCtrl'
        });
        //spaces
        $routeProvider.when('/public-space', {
            templateUrl: 'partials/spaces/index.html',
            controller: 'spacesCtrl'
        });
        $routeProvider.when('/public-space/:extra', {
            templateUrl: 'partials/spaces/index.html',
            controller: 'spacesCtrl'
        });
        //pages
        $routeProvider.when('/pages', {
            templateUrl: 'partials/pages/list.html',
            controller: 'pagesCtrl'
        });
        $routeProvider.when('/page/:extra', {
            templateUrl: 'partials/pages/list.html',
            controller: 'pagesCtrl'
        });

        $routeProvider.when('/pages/:pageID', {
            templateUrl: 'partials/pages/view.html',
            controller: 'pagesCtrl'
        });

        $routeProvider.when('/pages/edit/:pageID/', {
            templateUrl: 'partials/pages/edit.html',
            controller: 'pagesCtrl'
        });

        $routeProvider.when('/pages/new/:newPage/', {
            templateUrl: 'partials/pages/edit.html',
            controller: 'pagesCtrl'
        });
        //queries

        $routeProvider.when('/query/new/:queryID', {
            templateUrl: 'partials/report/edit.html',
            controller: 'reportCtrl'
        });
        $routeProvider.when('/query/edit/:queryID', {
            templateUrl: 'partials/report/edit.html',
            controller: 'reportCtrl'
        });

        //explore
        $routeProvider.when('/explore', {
            //templateUrl: 'partials/query/exploreIndex.html',
            //controller: 'queryCtrl'
            templateUrl: 'partials/report_v2/edit.html',
            controller: 'report_v2Ctrl'
        });
        $routeProvider.when('/explore/:extra', {
           // templateUrl: 'partials/query/exploreIndex.html',
            //controller: 'queryCtrl'
            templateUrl: 'partials/report_v2/edit.html',
            controller: 'report_v2Ctrl'
        });

        //catalog
        $routeProvider.when('/catalog', {
            templateUrl: 'partials/catalog/view.html',
            controller: 'catalogCtrl'
        });
        $routeProvider.when('/catalog/:extra', {
            templateUrl: 'partials/catalog/view.html',
            controller: 'catalogCtrl'
        });

        //reports V2
        /*
        $routeProvider.when('/reports-v2', {
            templateUrl: 'partials/report_v2/list.html',
            controller: 'report_v2Ctrl'
        });
        $routeProvider.when('/reports-v2/:extra', {
            templateUrl: 'partials/report_v2/list.html',
            controller: 'report_v2Ctrl'
        });*/

        $routeProvider.when('/reports-v2/:reportID/', {
            templateUrl: 'partials/report-view/view.html',
            controller: 'report_viewCtrl'
        });

        $routeProvider.when('/reports-v2/:reportID/:elementID/:elementValue', {
            templateUrl: 'partials/report_v2/view.html',
            controller: 'report_v2Ctrl'
        });

        $routeProvider.when('/reports-v2/new/:reportID/', {
            templateUrl: 'partials/report_v2/edit.html',
            controller: 'report_v2Ctrl'
        });
        $routeProvider.when('/reports-v2/edit/:reportID/', {
            templateUrl: 'partials/report_v2/edit.html',
            controller: 'report_v2Ctrl'
        });

        /*setup*/

        $routeProvider.when('/setup', {
            templateUrl: 'partials/setup/index.html',
            controller: 'setupCtrl'
        });

    }])
.factory('$sessionStorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.sessionStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.sessionStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.sessionStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return ($window.sessionStorage[key]) ? JSON.parse($window.sessionStorage[key]) : false;
        },
        removeObject: function(key) {
            delete($window.sessionStorage[key]);
        }
    };
}])
.factory('$localStorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return ($window.localStorage[key]) ? JSON.parse($window.localStorage[key]) : false;
        },
        removeObject: function(key) {
            delete($window.localStorage[key]);
        }
    };
}]);

app.factory('PagerService', PagerService);

app.directive('sizeelement', function ($window) {
    return{
        scope:true,
        priority: 0,
        link: function (scope, element) {
            scope.$watch(function(){return $(element).height(); }, function(newValue, oldValue) {
                scope.height=$(element).height();
            });
        }}
});

app.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'event': event});
                });

                event.preventDefault();
            }
        });
    };
});

app.service('queryService', function() {
  var theQuery = {};

  var addQuery = function(newObj) {
      theQuery = newObj;
  };

  var getQuery = function(){
      return theQuery;
  };

  return {
    addQuery: addQuery,
    getQuery: getQuery
  };

});

app.service('reportService', function() {
  var theReport = {};

  var addReport = function(newObj) {
      theReport = newObj;
  };

  var getReport = function(){
      return theReport;
  };

  return {
    addReport: addReport,
    getReport: getReport
  };

});

app.run(['$rootScope', '$sessionStorage','connection', function($rootScope, $sessionStorage, connection) {
    $rootScope.removeFromArray = function(array, item) {
        var index = array.indexOf(item);

        if (index > -1) array.splice(index, 1);
    };

    $rootScope.goBack = function() {
        window.history.back();
    };

    $rootScope.getUserContextHelp = function(contextHelpName)
    {
        var found = false;

        if ($rootScope.user.contextHelp)
            {
                for (var i in $rootScope.user.contextHelp)
                    {
                        if ($rootScope.user.contextHelp[i] == contextHelpName)
                            {
                                found = true;
                            }
                    }
            }

        return !found;
    }

    $rootScope.setUserContextHelpViewed = function(contextHelpName)
    {
        var params = (params) ? params : {};
        params.contextHelpName = contextHelpName;
        connection.get('/api/set-viewed-context-help', params, function(data) {
            $rootScope.user.contextHelp = data.items;
        });

    }

    $rootScope.user = $sessionStorage.getObject('user');
    if (!$rootScope.user) {
        connection.get('/api/get-user-data', {}, function(data) {
            if (!data.items.user) return window.location.href="/login";

            var theUser = data.items.user;
            theUser.companyData = data.items.companyData;
            theUser.rolesData = data.items.rolesData;
            theUser.reportsCreate = data.items.reportsCreate;
            theUser.dashboardsCreate = data.items.dashboardsCreate;
            theUser.pagesCreate = data.items.pagesCreate;
            theUser.exploreData = data.items.exploreData;
            theUser.isWSTADMIN = data.items.isWSTADMIN;
            theUser.contextHelp = data.items.contextHelp;
            theUser.dialogs = data.items.dialogs;
            theUser.viewSQL = data.items.viewSQL;
            $rootScope.user = theUser;
            $sessionStorage.setObject('user', theUser);
            $rootScope.isWSTADMIN = isWSTADMIN($rootScope);
        });
    } else {
        $rootScope.isWSTADMIN = isWSTADMIN($rootScope);
    }





        connection.get('/api/get-user-objects', {}, function(data) {
            $rootScope.userObjects = data.items;
            $rootScope.user.canPublish = data.userCanPublish;
        });





}]);

app.run(function (bsLoadingOverlayService) {
  bsLoadingOverlayService.setGlobalConfig({
    delay: 0, // Minimal delay to hide loading overlay in ms.
    activeClass: undefined, // Class that is added to the element where bs-loading-overlay is applied when the overlay is active.
    templateUrl: 'partials/loading-overlay-template.html' // Template url for overlay element. If not specified - no overlay element is created.
  });
});

function isWSTADMIN($rootScope)
{
    var found = false;
    for (var i in $rootScope.user.roles)
    {
        if ($rootScope.user.roles[i] == 'WSTADMIN')
            found = true;
    }

    return found;
}


function PagerService() {
    // service definition
    var service = {};

    service.GetPager = GetPager;

    return service;

    // service implementation
    function GetPager(totalItems, currentPage, pageSize, totalPages) {
        // default to first page
        currentPage = currentPage || 1;

        // default page size is 10
        pageSize = pageSize || 10;

        // calculate total pages
        //totalPages = totalPages Math.ceil(totalItems / pageSize);

        var startPage, endPage;
        if (totalPages <= 10) {
            // less than 10 total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than 10 total pages so calculate start and end pages
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }

        // calculate start and end item indexes
        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        //var pages = range(startPage, endPage + 1,1);

        var pages = [];
        var i = startPage;
        while (i < endPage +1) {
            pages.push(i);
            i++;
            }

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }
}


