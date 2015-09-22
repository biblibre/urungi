
'use strict';

var app = angular.module('WideStage', [
       //'ngRoute','ui.sortable','lvl.directives.dragdrop','ngTable','gridster' , 'sparkline','vs-repeat','ui.bootstrap.tabs','angularTreeview','ngDragDrop','ui.layout'
        'ngRoute','ui.sortable','gridster','ui.layout','angularTreeview', 'draganddrop', 'ui.bootstrap', 'ngCsvImport', 'checklist-model', 'ng-nestable',
        'infinite-scroll','angular-canv-gauge','ui.bootstrap-slider', 'widestage.directives','ngSanitize', 'ui.select','tg.dynamicDirective','angularUUID2','vs-repeat',
        'ui.bootstrap.datetimepicker','ui.tree'
    ])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/home'});

        $routeProvider.when('/home', {
            templateUrl: 'partials/home/index.html',
            controller: 'homeCtrl'
        });
        $routeProvider.when('/dashboards', {
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

        //http://www.jointjs.com/tutorial

        $routeProvider.when('/reports', {
            templateUrl: 'partials/report/list.html',
            controller: 'reportCtrl'
        });

        $routeProvider.when('/reports/:reportID/', {
            templateUrl: 'partials/report/view.html',
            controller: 'reportCtrl'
        });

        $routeProvider.when('/reports/:reportID/:elementID/:elementValue', {
            templateUrl: 'partials/report/view.html',
            controller: 'reportCtrl'
        });

        $routeProvider.when('/reports/new/:reportID/', {
            templateUrl: 'partials/report/edit.html',
            controller: 'reportCtrl'
        });
        $routeProvider.when('/reports/edit/:reportID/', {
            templateUrl: 'partials/report/edit.html',
            controller: 'reportCtrl'
        });

        //CUBES

        $routeProvider.when('/cubes', {
            templateUrl: 'partials/cube/list.html',
            controller: 'cubeCtrl'
        });

        $routeProvider.when('/cubes/:cubeID/', {
            templateUrl: 'partials/cube/view.html',
            controller: 'cubeCtrl'
        });

        $routeProvider.when('/cubes/new/:newCube/', {
            templateUrl: 'partials/cube/editNew.html',
            controller: 'cubeCtrl'
        });

        //Data sources

        $routeProvider.when('/data-sources', {
            templateUrl: 'partials/data-source/list.html',
            controller: 'dataSourceCtrl'
        });

        $routeProvider.when('/data-sources/:dataSourceID/', {
            templateUrl: 'partials/data-source/view.html',
            controller: 'dataSourceCtrl'
        });

        $routeProvider.when('/data-sources/edit/:dataSourceID/', {
            templateUrl: 'partials/data-source/edit.html',
            controller: 'dataSourceCtrl'
        });

        $routeProvider.when('/data_sources/new/:newDataSource/', {
            templateUrl: 'partials/data-source/source_wizard.html',
            controller: 'dataSourceCtrl'
        });

        //layers

        $routeProvider.when('/layers', {
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
        }
    };
}]);
/*
var app = angular.module('DataRepublic', ['ngRoute']).
    config(['$stateProvider','$urlRouterProvider','$locationProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/home")

        $stateProvider
            .state('home',{
                url:'/home',
                templateUrl : 'partial/mainDashboard',
                controller : 'mainDashboardCtrl'
            })

    }]);
*/


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

app.run(['$rootScope', '$sessionStorage','connection', function($rootScope, $sessionStorage, connection) {
    console.log('widestage app running');

    $rootScope.removeFromArray = function(array, item) {
        var index = array.indexOf(item);

        if (index > -1) array.splice(index, 1);
    };

    $rootScope.goBack = function() {
        window.history.back();
    };

    $rootScope.user = $sessionStorage.getObject('user');

    if (!$rootScope.user) {

    } else {
        $rootScope.isWSTADMIN = isWSTADMIN($rootScope);

    }


    /*
    connection.get('/api/company/get-company-data', {}, function(data) {
        $rootScope.companyData = data.items;
        console.log('this is the company data',$rootScope.companyData);

        connection.get('/api/get-counts', {}, function(data) {
            $rootScope.counts = data;
        });
    });
    */
    connection.get('/api/get-counts', {}, function(data) {
        $rootScope.counts = data;
    });

}]);

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