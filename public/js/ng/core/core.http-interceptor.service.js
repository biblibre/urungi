angular.module('app.core').factory('httpInterceptor', httpInterceptor);

httpInterceptor.$inject = ['base'];

function httpInterceptor (base) {
    return {
        request: function (config) {
            if (config.url.startsWith('/')) {
                config.url = base + config.url;
            }

            return config;
        },
    };
}
