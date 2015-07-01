
'use strict';

var app = angular.module('WideStage', [
       //'ngRoute','ui.sortable','lvl.directives.dragdrop','ngTable','gridster' , 'sparkline','vs-repeat','ui.bootstrap.tabs','angularTreeview','ngDragDrop','ui.layout'
        'ngRoute','ui.sortable','gridster','ui.layout','angularTreeview', 'draganddrop', 'ui.bootstrap', 'ngCsvImport', 'checklist-model', 'ng-nestable'

    ]).
    config(['$routeProvider', function($routeProvider) {
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

        $routeProvider.when('/dashboards/new/:newDashboard/', {
            templateUrl: 'partials/dashboard/view.html',
            controller: 'reportCtrl'
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

        $routeProvider.when('/reports/new/:newReport/', {
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
            templateUrl: 'partials/data-source/source_wizard_index.html',
            controller: 'dataSourceCtrl'
        });

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
})

app.run(['$rootScope', function($rootScope) {
    console.log('widestage app running');

    $rootScope.removeFromArray = function(array, item) {
        var index = array.indexOf(item);

        if (index > -1) array.splice(index, 1);
    };
}]);