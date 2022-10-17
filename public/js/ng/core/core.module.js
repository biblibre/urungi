(function () {
    'use strict';

    angular.module('app.core', ['ngSanitize', 'gettext'])
        .config(config)
        .run(run);

    config.$inject = ['$httpProvider'];
    function config ($httpProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
    }

    run.$inject = ['gettextCatalog', 'messages'];
    function run (gettextCatalog, messages) {
        if (messages) {
            const language = messages[''].language;
            gettextCatalog.setStrings(language, messages);
            gettextCatalog.setCurrentLanguage(language);
        }
    }
})();
