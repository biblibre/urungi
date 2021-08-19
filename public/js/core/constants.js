/* global moment: false, numeral: false */
(function () {
    'use strict';

    const baseURI = new URL(document.baseURI);
    const base = baseURI.pathname.substring(0, baseURI.pathname.lastIndexOf('/'));

    angular.module('app.core')
        .constant('moment', moment)
        .constant('numeral', numeral)
        .constant('base', base);
})();
