(function () {
    'use strict';

    angular.module('app.core').directive('translate', translate);

    translate.$inject = ['$compile', 'i18n'];
    function translate ($compile, i18n) {
        return {
            restrict: 'AE',
            scope: false,
            link: link,
        };

        function link (scope, element, attrs, controller, transcludeFn) {
            const html = element.html().trim();
            const translated = i18n.gettext(html);
            const wrapper = angular.element('<span>' + translated + '</span>');
            $compile(wrapper.contents())(scope);
            element.html(wrapper.contents());
        }
    }
})();
