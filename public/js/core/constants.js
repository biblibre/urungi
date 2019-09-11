/* global Noty: false, moment: false, numeral: false */
(function () {
    'use strict';

    angular.module('app.core')
        .constant('Noty', Noty)
        .constant('moment', moment)
        .constant('numeral', numeral);
})();
