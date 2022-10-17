(function(){'use strict';angular.module('app.table').run(['$templateCache', function($templateCache) {$templateCache.put('partials/table/table.pager.component.html','<div ng-if="vm.totalPages > 1">\n    <ul class="pagination">\n        <li ng-class="{disabled:vm.currentPage === 1}">\n            <a ng-click="vm.goToPage(1)" translate>First</a>\n        </li>\n        <li ng-class="{disabled:vm.currentPage === 1}">\n            <a ng-click="vm.goToPage(vm.currentPage - 1)" translate>Previous</a>\n        </li>\n        <li ng-repeat="page in vm.pages" ng-class="{active:vm.currentPage === page}">\n            <a ng-click="vm.goToPage(page)">{{page}}</a>\n        </li>\n        <li ng-class="{disabled:vm.currentPage === vm.totalPages}">\n            <a ng-click="vm.goToPage(vm.currentPage + 1)" translate>Next</a>\n        </li>\n        <li ng-class="{disabled:vm.currentPage === vm.totalPages}">\n            <a ng-click="vm.goToPage(vm.totalPages)" translate>Last</a>\n        </li>\n    </ul>\n</div>\n');
$templateCache.put('partials/table/table.table-column-sort.component.html','<span class="sort-button" ng-class="{ \'active\' : vm.sortDir }" ng-click="vm.onSortClick()">\n    <i ng-class="vm.sortClass()"></i>\n</span>\n');}]);})();