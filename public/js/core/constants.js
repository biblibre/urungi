/* global PNotify: false, PNotifyBootstrap3: false, PNotifyFontAwesome4: false, moment: false, numeral: false, L : false */
(function () {
    'use strict';

    const baseURI = new URL(document.baseURI);
    const base = baseURI.pathname.substring(0, baseURI.pathname.lastIndexOf('/'));

    angular.module('app.core')
        .constant('PNotify', PNotify)
        .constant('PNotifyBootstrap3', PNotifyBootstrap3)
        .constant('PNotifyFontAwesome4', PNotifyFontAwesome4)
        .constant('moment', moment)
        .constant('numeral', numeral)
        .constant('L', L)
        .constant('base', base);
})();
