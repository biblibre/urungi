(function () {
    'use strict';

    angular.module('app.core').component('appListPanel', {
        templateUrl: 'partials/core/list-panel.html',
        controller: ListPanelController,
        controllerAs: 'vm',
        transclude: true,
        bindings: {
            columns: '<',
            refresh: '<',
        },
    });

    ListPanelController.$inject = ['$timeout'];

    function ListPanelController ($timeout) {
        const vm = this;

        vm.page = 1;
        vm.currentPage = 1;
        vm.sort = undefined;
        vm.sortDir = 1;
        vm.filters = {};
        vm.$onInit = $onInit;
        vm.onFilterKeydown = onFilterKeydown;
        vm.onFilterBlur = onFilterBlur;
        vm.onSortClick = onSortClick;
        vm.goToPage = goToPage;

        function $onInit () {
            vm.sort = vm.columns[0].name;
            triggerRefresh();
        }

        let filterKeydownTimeoutPromise;
        function onFilterKeydown () {
            $timeout.cancel(filterKeydownTimeoutPromise);
            filterKeydownTimeoutPromise = $timeout(function () {
                vm.page = 1;
                triggerRefresh();
            }, 250);
        };

        function onFilterBlur () {
            $timeout.cancel(filterKeydownTimeoutPromise);
            vm.page = 1;
            triggerRefresh();
        };

        function onSortClick (column) {
            vm.sort = column.name;
            vm.sortDir *= -1;
            triggerRefresh();
        };

        function goToPage (page) {
            vm.page = page;
            triggerRefresh();
        }

        function triggerRefresh () {
            const params = {
                filters: vm.filters,
                sort: vm.sort,
                sortType: vm.sortDir,
                page: vm.page,
            };
            vm.refresh(params).then(result => {
                vm.currentPage = result.page;
                vm.pages = result.pages;
            });
        }
    }
})();
