const baseURI = new URL(document.baseURI);
const base = baseURI.pathname.substring(0, baseURI.pathname.lastIndexOf('/'));

angular.module('app.core')
    .constant('base', base);
