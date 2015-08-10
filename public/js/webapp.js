
'use strict';

var app = angular.module('WideStage', [
       //'ngRoute','ui.sortable','lvl.directives.dragdrop','ngTable','gridster' , 'sparkline','vs-repeat','ui.bootstrap.tabs','angularTreeview','ngDragDrop','ui.layout'
        'ngRoute','ui.sortable','gridster','ui.layout','angularTreeview', 'draganddrop', 'ui.bootstrap', 'ngCsvImport', 'checklist-model', 'ng-nestable',
        'infinite-scroll','angular-canv-gauge','ui.bootstrap-slider', 'widestage.directives','ngSanitize', 'ui.select','tg.dynamicDirective'
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

app.run(['$rootScope', function($rootScope) {
    console.log('widestage app running');

    $rootScope.removeFromArray = function(array, item) {
        var index = array.indexOf(item);

        if (index > -1) array.splice(index, 1);
    };

    $rootScope.goBack = function() {
        window.history.back();
    };
}]);