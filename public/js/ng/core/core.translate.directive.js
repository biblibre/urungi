import { t } from '../../i18n.js';

angular.module('app.core').directive('translate', translate);

translate.$inject = ['$compile'];
function translate ($compile) {
    return {
        restrict: 'AE',
        scope: false,
        link,
    };

    function link (scope, element, attrs, controller, transcludeFn) {
        const html = element.html().trim();
        const translated = t(html);
        const wrapper = angular.element('<span>' + translated + '</span>');
        $compile(wrapper.contents())(scope);
        element.html(wrapper.contents());
    }
}
