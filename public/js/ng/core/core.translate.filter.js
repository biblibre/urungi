(function () {
    'use strict';

    angular.module('app.core').filter('translate', translate);

    translate.$inject = ['i18n'];
    function translate (i18n) {
        return function (text) {
            return i18n.gettext(text);
        };
    }
})();
