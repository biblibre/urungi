app.service('PagerService', function () {
    this.GetPager = function (totalItems, currentPage, pageSize, totalPages) {
    // default to first page
        currentPage = parseFloat(currentPage) || 1;

        // default page size is 10
        pageSize = pageSize || 10;

        // calculate total pages
        // totalPages = totalPages Math.ceil(totalItems / pageSize);

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

        // calculate start and end item indexes
        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        // var pages = range(startPage, endPage + 1,1);

        var pages = [];
        var i = startPage;
        while (i < endPage + 1) {
            pages.push(i);
            i++;
        }

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    };
});
