(function () {
    'use strict';

    angular.module('app.table').component('appTableColumnSort', {
        bindings: {
            onSort: '&',
            sortDir: '<',
        },
        controller: TableColumnSortController,
        controllerAs: 'vm',
        templateUrl: 'partials/table/table.table-column-sort.component.html',
    });

    function TableColumnSortController () {
        const vm = this;

        vm.onSortClick = onSortClick;
        vm.sortClass = sortClass;

        function onSortClick () {
            const newDir = vm.sortDir ? -1 * vm.sortDir : 1;
            vm.onSort({ $dir: newDir });
        }

        function sortClass () {
            return vm.sortDir === 1
                ? 'fa fa-sort-asc'
                : vm.sortDir === -1
                    ? 'fa fa-sort-desc'
                    : 'fa fa-sort';
        }
    }
})();
