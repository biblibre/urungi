(function () {
    'use strict';

    angular.module('app.core').factory('language', language);

    language.$inject = ['gettextCatalog', 'moment', 'base'];

    function language (gettextCatalog, moment, base) {
        const defaultLanguage = 'en';
        const availableLanguages = ['en', 'es', 'fr'];

        const service = {
            getAvailableLanguages: getAvailableLanguages,
            setCurrentLanguage: setCurrentLanguage,
            getCurrentLanguage: getCurrentLanguage,
            setLanguageFromLocalStorage: setLanguageFromLocalStorage,
        };

        return service;

        function getAvailableLanguages () {
            return availableLanguages;
        }

        function setCurrentLanguage (code) {
            if (!availableLanguages.includes(code)) {
                code = defaultLanguage;
            }

            gettextCatalog.setCurrentLanguage(code);
            if (code !== defaultLanguage) {
                gettextCatalog.loadRemote('/translations/' + code + '.json');
            }

            localStorage.setItem('currentLanguage', code);

            moment.locale(code);
        }

        function getCurrentLanguage () {
            return gettextCatalog.getCurrentLanguage();
        }

        function setLanguageFromLocalStorage () {
            const currentLanguage = localStorage.getItem('currentLanguage');
            setCurrentLanguage(currentLanguage);
        }
    }
})();
