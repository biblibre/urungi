(function () {
    'use strict';

    angular.module('app.theme').component('appThemeSelect', {
        template: '<select ng-model="vm.theme" ng-options="t for t in vm.themes" ng-change="vm.change()" class="form-control"><option value=""></option></select>',
        controller: ThemeSelectController,
        controllerAs: 'vm',
        bindings: {
            parentTheme: '<theme',
            onChange: '&',
        },
    });

    ThemeSelectController.$inject = ['api'];

    function ThemeSelectController (api) {
        const vm = this;

        vm.$onInit = $onInit;
        vm.$onChanges = $onChanges;
        vm.change = change;
        vm.theme = undefined;
        vm.themes = [];

        function $onInit () {
            api.getThemes().then(res => {
                vm.themes.push.apply(vm.themes, res.data);
                if (vm.themes.includes(vm.parentTheme)) {
                    vm.theme = vm.parentTheme;
                }
            });
        }

        function $onChanges (changes) {
            if (vm.themes.includes(vm.parentTheme)) {
                vm.theme = vm.parentTheme;
            }
        }

        function change () {
            vm.onChange({ theme: vm.theme });
        }
    }
})();
