/* global PNotify: false, PNotifyBootstrap4: false, moment: false, numeral: false */
(function () {
    'use strict';

    const baseURI = new URL(document.baseURI);
    const base = baseURI.pathname.substring(0, baseURI.pathname.lastIndexOf('/'));

    angular.module('app.core')
        .constant('PNotify', PNotify)
        .constant('PNotifyBootstrap4', PNotifyBootstrap4)
        .constant('moment', moment)
        .constant('numeral', numeral)
        .constant('base', base);
})();
