(function(){'use strict';angular.module('app.dashboard-list').run(['$templateCache', function($templateCache) {$templateCache.put('partials/dashboard-list/dashboard-list.component.html','<div class="page-header">\n    <span class="h3" translate>Dashboards</span>\n\n    <a id="newDashboardButton" ng-if="vm.creationAuthorised || vm.isAdmin" href="dashboards/new" class="btn btn-success pull-right" uib-tooltip="{{ \'Click here to create a new dashboard\' | translate }}" tooltip-placement="bottom" translate>Create new dashboard</a>\n    <a class="btn btn-info pull-right" ng-click="vm.showIntro()" style="margin-right: 3px;" uib-tooltip="{{ \'Follow the guided tour for dashboards\' | translate }}" tooltip-placement="bottom"><i class="fa fa-question-circle"></i></a>\n</div>\n\n<div class="row">\n    <div class="col-md-12">\n        <table class="table table-striped">\n            <colgroup>\n                <col style="width: 40%;">\n                <col style="width: 20%;">\n                <col style="width: 20%;">\n                <col style="width: 20%;">\n            </colgroup>\n            <thead>\n                <tr>\n                    <th>\n                        <span translate>Name</span>\n                        <app-table-column-sort on-sort="vm.onSort(\'dashboardName\', $dir)" sort-dir="vm.sortDir[\'dashboardName\']"></app-table-column-sort>\n                    </th>\n                    <th>\n                        <span translate>Author</span>\n                        <app-table-column-sort on-sort="vm.onSort(\'author\', $dir)" sort-dir="vm.sortDir[\'author\']"></app-table-column-sort>\n                    </th>\n                    <th>\n                        <span translate>Created on</span>\n                        <app-table-column-sort on-sort="vm.onSort(\'createdOn\', $dir)" sort-dir="vm.sortDir[\'createdOn\']"></app-table-column-sort>\n                    </th>\n                    <th></th>\n                </tr>\n                <tr>\n                    <td>\n                        <app-table-column-filter on-filter="vm.onFilter(\'dashboardName\', $value)"></app-table-column-filter>\n                    </td>\n                    <td>\n                        <app-table-column-filter on-filter="vm.onFilter(\'author\', $value)"></app-table-column-filter>\n                    </td>\n                    <td></td>\n                </tr>\n            </thead>\n            <tbody>\n                <tr ng-repeat="dashboard in vm.dashboards">\n                    <td>\n                        <a ng-href="dashboards/view/{{ dashboard._id }}">{{ dashboard.dashboardName }}</a>\n                        <div class="badge-list">\n                            <span ng-if="dashboard.isPublic" class="badge" translate>public</span>\n                            <span ng-if="dashboard.isShared" class="badge" translate>shared</span>\n                        </div>\n                    </td>\n                    <td>{{ dashboard.author }}</td>\n                    <td>{{ dashboard.createdOn | date }}</td>\n                    <td><app-dashboards-list-buttons dashboard="dashboard" on-delete="vm.refresh()" on-duplicate="vm.refresh()"></app-dashboards-list-buttons></td>\n                </tr>\n            </tbody>\n        </table>\n\n        <app-pager current-page="vm.currentPage" total-pages="vm.pages" on-page-change="vm.goToPage(page)"></app-pager>\n    </div>\n</div>\n');
$templateCache.put('partials/dashboard-list/dashboard-list.dashboards-list-buttons.component.html','<div ng-if="vm.creationAuthorised || vm.isAdmin" class="btn-group btn-group-sm pull-right" role="group">\n    <button class="btn btn-silver"\n        uib-tooltip="{{ \'Share\' | translate }}"\n        uib-popover-template="\'share-popover.html\'"\n        popover-title="{{ \'Share to...\' | translate }}"\n        popover-trigger="\'outsideClick\'"\n        popover-placement="left"\n        popover-append-to-body="true"\n    >\n        <i class="fa fa-share-alt"></i>\n    </button>\n\n    <a class="btn btn-silver" ng-href="dashboards/edit/{{ vm.dashboard._id }}" uib-tooltip="{{ \'Edit this dashboard\' | translate }}" tooltip-placement="bottom">\n        <i class="fa fa-pencil"></i>\n    </a>\n\n    <button class="btn btn-silver" ng-click="vm.openDuplicateModal()" uib-tooltip="{{ \'Duplicate this dashboard\' | translate}}" tooltip-placement="bottom">\n        <i class="fa fa-copy"></i>\n    </button>\n\n    <button class="btn btn-danger" ng-click="vm.openDeleteModal()" uib-tooltip="{{ \'Delete this dashboard\' | translate}}" tooltip-placement="bottom">\n        <i class="fa fa-trash-o"></i>\n    </button>\n</div>\n<script type="text/ng-template" id="share-popover.html">\n    <app-share-popover item="vm.dashboard" publish="vm.publish" unpublish="vm.unpublish" share="vm.share" unshare="vm.unshare" get-copy-link="vm.getCopyLink"></app-share-popover>\n</script>\n');}]);})();