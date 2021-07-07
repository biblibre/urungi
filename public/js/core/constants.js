/* global Noty: false, moment: false, numeral: false, L : false */
(function () {
    'use strict';

    const baseURI = new URL(document.baseURI);
    const base = baseURI.pathname.substring(0, baseURI.pathname.lastIndexOf('/'));

    angular.module('app.core')
        .constant('Noty', Noty)
        .constant('moment', moment)
        .constant('numeral', numeral)
        .constant('base', base)
        .constant('L', L);
})();
