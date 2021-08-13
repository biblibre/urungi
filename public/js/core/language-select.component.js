(function () {
    'use strict';

    angular.module('app.core').component('appLanguageSelect', {
        templateUrl: 'partials/core/language-select.component.html',
        controller: LanguageSelectController,
        controllerAs: 'vm',
        bindings: {},
    });

    LanguageSelectController.$inject = ['language'];

    function LanguageSelectController (language) {
        const vm = this;

        vm.availableLanguages = [];
        vm.currentLanguage = undefined;
        vm.languageChanged = languageChanged;

        const languageLabels = {
            en: 'English',
            es: 'Español',
            fr: 'Français',
        };

        activate();

        function activate () {
            for (const code of language.getAvailableLanguages()) {
                vm.availableLanguages.push({
                    code: code,
                    label: (code in languageLabels) ? languageLabels[code] : code,
                });
            }

            const currentLanguage = language.getCurrentLanguage();
            vm.currentLanguage = vm.availableLanguages.find(l => {
                return l.code === currentLanguage;
            });
        }

        function languageChanged (choice) {
            localStorage.setItem('currentLanguage', choice.code);
            language.setCurrentLanguage(localStorage.getItem('currentLanguage'));
        };
    }
})();
