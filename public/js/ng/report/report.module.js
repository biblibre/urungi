/* global moment: false, numeral: false */
(function () {
    'use strict';

    angular.module('app.report', ['ui.select', 'app.core'])
        .constant('moment', moment)
        .constant('numeral', numeral);
})();
