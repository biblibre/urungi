/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 09/01/15
 * Time: 12:41
 * To change this template use File | Settings | File Templates.
 */


'use strict';

var app = angular.module('DataRepublic', [
        'ngRoute','ui.sortable','lvl.directives.dragdrop','ngTable','gridster' , 'sparkline','vs-repeat','ui.bootstrap.tabs'
    ]).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/home'});

        $routeProvider.when('/home', {
            templateUrl: 'js/home/index.html',
            controller: 'homeCtrl'
        });


        $routeProvider.when('/dashboards', {
            templateUrl: 'js/dashboard/index.html',
            controller: 'dashBoardCtrl'
        });

        $routeProvider.when('/dashboards/:dashboardID', {
            templateUrl: 'js/dashboard/view.html',
            controller: 'dashBoardCtrl'
        });



        $routeProvider.when('/reports', {
            templateUrl: 'js/report/list.html',
            controller: 'reportCtrl'
        });

        $routeProvider.when('/reports/:reportID/', {
            templateUrl: 'js/report/view.html',
            controller: 'reportCtrl'
        });

        $routeProvider.when('/new-report/', {
            templateUrl: 'js/report/edit.html',
            controller: 'reportCtrl'
        });

        $routeProvider.when('/clients', {
            templateUrl: 'js/clients/index.html',
            controller: 'clientsCtrl'
        });

        $routeProvider.when('/clients/:clientID/', {
            templateUrl: 'js/clients/view.html',
            controller: 'clientsCtrl'
        });

        $routeProvider.when('/new-client/', {
            templateUrl: 'js/clients/edit.html',
            controller: 'clientsCtrl'
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
function appRun($http, $rootScope, $sce) {

}