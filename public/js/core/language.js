(function () {
    'use strict';

    angular.module('app.core').factory('language', language);

    language.$inject = ['$window', 'gettextCatalog', 'moment', 'base'];

    function language ($window, gettextCatalog, moment, base) {
        const defaultLanguage = 'en';
        const availableLanguages = ['en', 'es', 'fr'];

        const service = {
            getAvailableLanguages: getAvailableLanguages,
            setCurrentLanguage: setCurrentLanguage,
            getCurrentLanguage: getCurrentLanguage,
            initLanguage: initLanguage,
        };

        return service;

        function getAvailableLanguages () {
            return availableLanguages;
        }

        function setCurrentLanguage (code, options = {}) {
            if (!availableLanguages.includes(code)) {
                code = defaultLanguage;
            }

            gettextCatalog.setCurrentLanguage(code);
            if (code !== defaultLanguage) {
                gettextCatalog.loadRemote('/translations/' + code + '.json');
            }

            if (options.save) {
                localStorage.setItem('currentLanguage', code);
            }

            moment.locale(code);
        }

        function getCurrentLanguage () {
            return gettextCatalog.getCurrentLanguage();
        }

        function initLanguage () {
            const currentLanguage = localStorage.getItem('currentLanguage');
            if (currentLanguage) {
                setCurrentLanguage(currentLanguage);
            } else {
                const navigator = $window.navigator;
                const navigatorLanguage = navigator.language.substr(0, 2);
                setCurrentLanguage(navigatorLanguage);
            }
        }
    }
})();
