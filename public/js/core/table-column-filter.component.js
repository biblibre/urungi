(function () {
    'use strict';

    angular.module('app.core').component('appTableColumnFilter', {
        bindings: {
            onFilter: '&',
        },
        controller: TableColumnFilterController,
        controllerAs: 'vm',
        template: '<input type="text" class="form-control input-sm" ng-keydown="vm.onKeydown($event)">',
    });

    TableColumnFilterController.$inject = ['$timeout'];

    function TableColumnFilterController ($timeout) {
        const vm = this;

        vm.onKeydown = onKeydown;

        let keydownTimeoutPromise;
        function onKeydown (ev) {
            $timeout.cancel(keydownTimeoutPromise);
            keydownTimeoutPromise = $timeout(function () {
                vm.onFilter({ $value: ev.target.value });
            }, 250);
        }
    }
})();
