angular.module('Urungi')
    .factory('language', ['gettextCatalog', function (gettextCatalog) {
        const defaultLanguage = 'en';
        const availableLanguages = ['en', 'fr'];

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
        }

        function getCurrentLanguage () {
            return gettextCatalog.getCurrentLanguage();
        }

        function setLanguageFromLocalStorage () {
            const currentLanguage = localStorage.getItem('currentLanguage');
            setCurrentLanguage(currentLanguage);
        }

        return {
            getAvailableLanguages: getAvailableLanguages,
            setCurrentLanguage: setCurrentLanguage,
            getCurrentLanguage: getCurrentLanguage,
            setLanguageFromLocalStorage: setLanguageFromLocalStorage,
        };
    }]);
