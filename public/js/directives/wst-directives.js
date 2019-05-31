angular.module('urungi.directives', [])
    .directive('languageSelect', ['language', function (language) {
        return {
            templateUrl: 'partials/directives/languageSelect.html',
            link: function ($scope) {
                const languageLabels = {
                    'en': 'English',
                    'fr': 'Français',
                };

                $scope.availableLanguages = [];
                for (const code of language.getAvailableLanguages()) {
                    $scope.availableLanguages.push({
                        code: code,
                        label: (code in languageLabels) ? languageLabels[code] : code,
                    });
                }

                const currentLanguage = language.getCurrentLanguage();
                $scope.currentLanguage = $scope.availableLanguages.find(l => {
                    return l.code === currentLanguage;
                });

                $scope.languageChanged = function (choice) {
                    language.setCurrentLanguage(choice.code);
                };
            }
        };
    }]);
