/* global Urungi: false */
(function () {
    'use strict';

    const baseURI = new URL(document.baseURI);
    const base = baseURI.pathname.substring(0, baseURI.pathname.lastIndexOf('/'));

    angular.module('app.core')
        .constant('uuid', Urungi.uuid)
        .constant('messages', Urungi.messages)
        .constant('notify', Urungi.notify)
        .constant('base', base);
})();
