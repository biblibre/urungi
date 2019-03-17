(function () {
    'use strict';

    angular.module('app.core').factory('pager', pager);

    pager.$inject = [];

    function pager () {
        const service = {
            getPager: getPager,
        };

        return service;

        function getPager (currentPage, totalPages) {
            // default to first page
            currentPage = parseFloat(currentPage) || 1;

            var startPage, endPage;
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
            var pages = [];
            var i = startPage;
            while (i < endPage + 1) {
                pages.push(i);
                i++;
            }

            // return object with all pager properties required by the view
            return {
                currentPage: currentPage,
                totalPages: totalPages,
                pages: pages
            };
        }
    }
})();
