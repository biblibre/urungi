/* Controllers */
function WebAppCtrl($scope, $http,$window,$location) {

    /*$scope.loadBrandHomePage = function() {
        if ($scope.myBrand && $scope.myBrand.loadBrandHomeFile) {
            $.ajax({
                url: $scope.myBrand.brandHomeFile,
                dataType: 'html',
                success: function(html) {
                    $('#homeContainer').html(html);
                }
            });
        }
    };*/
}

WebAppCtrl.$inject = ["$scope","$http","$window","$location"];

function PublicCtrl($scope,$http,$rootScope, $sessionStorage) {
    $scope.login = function() {

        console.log('entering in login');
        var user = {"userName": $scope.userName, "password": $scope.password, "remember_me": $scope.rememberMe, "companyID": $('#companyID').attr('value')};

        if($scope.userName!==undefined || $scope.password !==undefined){
            $http({method: 'POST', url: '/api/login', data:user, withCredentials: true}).
                success(function(data, status, headers, config) {

                    $http.get('/api/init-data')
                        .success(angular.bind(this, function (data) {
                            $rootScope.user = data.user;
                            console.log('the user',JSON.stringify($rootScope.user));
                            $rootScope.configurations = data.configurations;

                            $sessionStorage.setObject('user', data.user);

                            $rootScope.loginRedirect();
                        }))
                        .error(angular.bind(this, function (data) {
                            noty({text: data,  timeout: 2000, type: 'error'});
                        }));

                }).
                error(function(data, status, headers, config) {
                    noty({text: data,  timeout: 2000, type: 'error'});
                });
        }
    };

    $scope.register = function() {
        var user = {"email": $scope.email, "password": $scope.password, "check_password": $scope.check_password};

        if($scope.email!==undefined || $scope.password !==undefined || $scope.check_password !==undefined){

            if($scope.password!==$scope.check_password){

                noty({text: 'Password and Check Password must be the same!',  timeout: 2000, type: 'error'});

            }else{
                $http({method: 'POST', url: '/api/register', data:user}).
                    success(function(data, status, headers, config) {
                        noty({text: data,  timeout: 2000, type: 'success'});

                        window.location.hash = '/login';
                    }).
                    error(function(data, status, headers, config) {

                        noty({text: data,  timeout: 2000, type: 'error'});

                    });
            }
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
}
PublicCtrl.$inject = ["$scope","$http","$rootScope","$sessionStorage"];

function VerificationCtrl($scope,$http,$window,$stateParams, vcRecaptchaService) {
    $scope.verify = function()
    {
        var valid = false;
        var recaptcha = vcRecaptchaService.data();

        var postData = {
            hash: $stateParams.hash,
            email: $stateParams.email,
            challenge: recaptcha.challenge,
            response: recaptcha.response
        };

        $http({method: 'POST', url: '/api/verify', data: postData}).
            success(function(data, status, headers, config) {
                if (data.result === 0) {
                    noty({text: data.msg,  timeout: 2000, type: 'error'});
                    vcRecaptchaService.reload();
                }
                else
                    $window.location.href="/home";
            }).
            error(function(data, status, headers, config) {
                //console.log(data);
            });
    };
}
VerificationCtrl.$inject = ["$scope","$http","$window","$stateParams", 'vcRecaptchaService'];

function ChangePwdCtrl($scope,$http,$window,$stateParams) {
    $scope.changePassword = function() {
        var data = {"hash": $stateParams.hash, "password": $scope.password};

        if($scope.password !==undefined || $scope.confirmation !==undefined) {

            if($scope.password!==$scope.confirmation){
                noty({text: 'Password and Check Password must be the same!',  timeout: 2000, type: 'error'});
            }else{
                $http({method: 'POST', url: '/api/change-password', data:data}).
                    success(function(data, status, headers, config) {
                        noty({text: data.msg,  timeout: 2000, type: 'success'});

                        window.location.hash = '/login';
                    }).
                    error(function(data, status, headers, config) {
                        noty({text: data.msg,  timeout: 2000, type: 'error'});
                    });
            }
        }
    };
}
ChangePwdCtrl.$inject = ["$scope","$http","$window","$stateParams"];