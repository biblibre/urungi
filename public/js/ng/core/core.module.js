(function () {
    'use strict';

    angular.module('app.core', ['ngSanitize'])
        .config(config);

    config.$inject = ['$httpProvider'];
    function config ($httpProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
    }
})();
