import { t } from '../../i18n.js';

angular.module('app.core').filter('translate', translate);

translate.$inject = [];
function translate () {
    return function (text) {
        return t(text);
    };
}
