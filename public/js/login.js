// Declare app level module which depends on filters, and services
//var app = angular.module('widestage-login', ['ui.router','myApp.filters', 'myApp.services', 'myApp.directives']).
var app = angular.module('widestage-login', ['ui.router']).
    config(['$stateProvider','$urlRouterProvider','$locationProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");

        /*$stateProvider
            .state('login',{
                url:'/',
                templateUrl : 'partial/login/index',
                controller : PublicCtrl
            })
            .state('verify',{
                url:'/verify/:hash/:email',
                templateUrl : 'partial/public/verify',
                controller : PublicCtrl
            })
            .state('change-password',{
                url:'/change-password/:hash',
                templateUrl : 'partial/public/changePassword',
                controller : ChangePwdCtrl
            });*/
    }]).service('Constants' , function () {

        var constants = {
            DEBUGMODE : false,
            CRYPTO: true,
            SECRET: "SecretPassphrase"
        };

        return constants;

        return {
            mifuncion: function() {
                return true;
            }
        }
    })
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
    }]).service('connection' , function ($http, Constants) {

        this.get = function(url, params, done, options) {
            options = {
                showLoader: (options && typeof options.showLoader != 'undefined') ? options.showLoader : true,
                showMsg: (options && typeof options.showMsg != 'undefined') ? options.showMsg : true
            };

            if (options.showLoader) $('#loader-overlay').show();

            if (Constants.CRYPTO) {
                var encrypted = CryptoJS.AES.encrypt(JSON.stringify(params), Constants.SECRET);
                params = {data: String(encrypted)};
            }

            $http({method: 'GET', url: url, params: params})
                .success(angular.bind(this, function (data, status, headers, config) {
                    if (typeof data == 'string') window.location.href = '/';

                    if (Constants.CRYPTO) {
                        var decrypted = CryptoJS.AES.decrypt(data.data, Constants.SECRET);
                        data = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
                    }

                    if (typeof done != 'undefined' && done)
                        done(data);

                    if (options.showLoader) $('#loader-overlay').hide();

                    if (data.result == 1 && data.msg && options.showMsg) {
                        noty({text: data.msg,  timeout: 2000, type: 'success'});
                    }
                    else if (data.result === 0 && data.msg && options.showMsg) {
                        noty({text: data.msg,  timeout: 2000, type: 'error'});
                    }
                }))
                .error(angular.bind(this, function (data, status, headers, config) {
                    if (options.showLoader) $('#loader-overlay').hide();

                    noty({text: 'Error',  timeout: 2000, type: 'error'});
                }));

        };

        this.post = function(url, data, done, options) {
            options = {
                showLoader: (options && typeof options.showLoader != 'undefined') ? options.showLoader : true,
                showMsg: (options && typeof options.showMsg != 'undefined') ? options.showMsg : true
            };

            if (options.showLoader) $('#loader-overlay').show();

            if (typeof data._id != 'undefined') data.id = data._id;

            if (Constants.CRYPTO) {
                var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), Constants.SECRET);
                data = {data: String(encrypted)};
            }

            $http.post(url, data)
                .success(angular.bind(this, function (data, status, headers, config) {
                    if (typeof data == 'string') window.location.href = '/';

                    if (Constants.CRYPTO) {
                        var decrypted = CryptoJS.AES.decrypt(data.data, Constants.SECRET);
                        data = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
                    }

                    if (typeof done != 'undefined' && done)
                        done(data);

                    if (options.showLoader) $('#loader-overlay').hide();

                    if (data.result == 1 && data.msg && options.showMsg) {
                        noty({text: data.msg,  timeout: 2000, type: 'success'});
                    }
                    else if (data.result === 0 && data.msg && options.showMsg) {
                        noty({text: data.msg,  timeout: 2000, type: 'error'});
                    }
                }))
                .error(angular.bind(this, function (data, status, headers, config) {
                    if (options.showLoader) $('#loader-overlay').hide();

                    noty({text: 'Error',  timeout: 2000, type: 'error'});
                }));
        };

        return this;
    }).controller('PublicCtrl', function ($scope,$http,$rootScope, $sessionStorage, connection) {
        $scope.loginError = false;
        $scope.errorLoginMessage = '';
        $scope.login = function() {


            var user = {"userName": $scope.userName, "password": $scope.password, "remember_me": $scope.rememberMe, "companyID": $('#companyID').attr('value')};

            if($scope.userName!==undefined || $scope.password !==undefined){
                $http({method: 'POST', url: '/api/login', data:user, withCredentials: true}).
                    success(function(data, status, headers, config) {

                        $scope.loginError = false;

                        //console.log('success',JSON.stringify(data));


                        var theUser = data.user;
                        //console.log('the user',JSON.stringify($rootScope.user))
                        //obtener compañía y roles del usuario

                        connection.get('/api/get-user-data', {}, function(data) {
                            theUser.companyData = data.items.companyData;
                            theUser.rolesData = data.items.rolesData;
                            theUser.reportsCreate = data.items.reportsCreate;
                            theUser.dashboardsCreate = data.items.dashboardsCreate;
                            theUser.isWSTADMIN = data.items.isWSTADMIN;
                            console.log('this is the user',JSON.stringify(theUser));
                            $rootScope.user = theUser;
                            $sessionStorage.setObject('user', theUser);
                            $rootScope.loginRedirect();

                        });



                        /*
                        $http.get('/api/init-data')
                            .success(angular.bind(this, function (data) {
                                $rootScope.user = data.user;
                                $rootScope.configurations = data.configurations;

                                $sessionStorage.setObject('user', data.user);

                                $rootScope.loginRedirect();
                            }))
                            .error(angular.bind(this, function (data) {
                                noty({text: data,  timeout: 2000, type: 'error'});
                            }));
                        */
                    }).
                    error(function(data, status, headers, config) {
                        //console.log('error in login',JSON.stringify(data));
                        //noty({text: data,  timeout: 2000, type: 'error'});
                        $scope.errorLoginMessage = data;
                        $scope.loginError = true;
                    });
            }
        };

        $scope.rememberPassword = function() {
            var data = {"email": $scope.email};

            if($scope.email!==undefined){
                $http({method: 'POST', url: '/api/remember-password', data:data}).
                    success(function(data, status, headers, config) {

                        noty({text: data.msg,  timeout: 2000, type: 'success'});

                        window.location.hash = '/login';
                    }).
                    error(function(data, status, headers, config) {
                        noty({text: data.msg,  timeout: 2000, type: 'error'});
                    });
            }
        };
    });

angular.module('widestage-login').run(['$http', '$rootScope', '$sce', '$sessionStorage', 'connection',
    function($http, $rootScope, $sce, $sessionStorage, connection) {

    //appRun($http, $rootScope, $sce, $sessionStorage, connection);



    $rootScope.loginRedirect = function() {
        var host = $('#host').attr('value');
        window.location.href="/#/home";
    };
}]);





