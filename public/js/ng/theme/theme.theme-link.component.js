(function () {
    'use strict';

    angular.module('app.theme').component('appThemeLink', {
        bindings: {
            theme: '<',
        },
        controllerAs: 'vm',
        template: '<link ng-if="vm.theme" ng-href="themes/{{ vm.theme }}.css" rel="stylesheet">',
    });
})();
