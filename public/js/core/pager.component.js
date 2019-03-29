(function () {
    'use strict';

    angular.module('app.core').component('appPager', {
        templateUrl: 'partials/core/pager.html',
        controller: PagerController,
        controllerAs: 'vm',
        bindings: {
            currentPage: '<',
            totalPages: '<',
            onPageChange: '&',
        },
    });

    function PagerController () {
        const vm = this;

        vm.pages = [];
        vm.$onChanges = onChanges;
        vm.goToPage = goToPage;

        function onChanges () {
            vm.currentPage = Number(vm.currentPage);
            vm.totalPages = Number(vm.totalPages);

            vm.pages = getPages(vm.currentPage, vm.totalPages);
        }

        function goToPage (page) {
            page = Math.max(1, Math.min(vm.totalPages, page));
            vm.onPageChange({ page: page });
        }

        function getPages (currentPage, totalPages) {
            currentPage = currentPage || 1;

            let startPage, endPage;
            if (totalPages <= 10) {
                // less than 10 total pages so show all
                startPage = 1;
                endPage = totalPages;
            } else {
                // more than 10 total pages so calculate start and end pages
                if (currentPage <= 6) {
                    startPage = 1;
                    endPage = 10;
                } else if (currentPage + 4 >= totalPages) {
                    startPage = totalPages - 9;
                    endPage = totalPages;
                } else {
                    startPage = currentPage - 5;
                    endPage = currentPage + 4;
                }
            }

            // create an array of pages to ng-repeat in the pager control
            const pages = [];
            let i = startPage;
            while (i < endPage + 1) {
                pages.push(i);
                i++;
            }

            return pages;
        }
    }
})();
