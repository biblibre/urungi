(function(){'use strict';angular.module('app.dashboard-view').run(['$templateCache', function($templateCache) {$templateCache.put('partials/dashboard-view/dashboard-view.component.html','<app-theme-link theme="vm.dashboard.theme"></app-theme-link>\n\n<div class="page-header hidden-print">\n    <a href="./" class="btn-home">\n        <i class="fa fa-home"></i>\n    </a>\n    <span class="h3" ng-bind="vm.dashboard.dashboardName"></span>\n\n    <div class="pull-right">\n        <div class="btn-group">\n            <button ng-class="{ disabled : vm.exportIsLoading }" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n                <span translate>Export</span> <span class="caret"></span>\n            </button>\n            <ul class="dropdown-menu">\n                <li ng-class="{ disabled: !vm.exportAsPNGAvailable }">\n                    <a href="" ng-click="vm.exportAsPNGAvailable && vm.downloadAsPNG()">As PNG</a>\n                </li>\n                <li ng-class="{ disabled: !vm.exportAsPDFAvailable }">\n                    <a href="" ng-click="vm.exportAsPDFAvailable && vm.downloadAsPDF()">As PDF</a>\n                </li>\n            </ul>\n        </div>\n        <a ng-click="vm.goBack();" class="btn btn-default" uib-tooltip="{{ \'Click here to cancel and backtrack\' | translate }}" tooltip-placement="bottom" translate>Cancel</a>\n        <a ng-if="vm.dashboard && ((vm.dashboard.owner == user._id) && vm.creationAuthorised || vm.isAdmin)" ng-href="dashboards/edit/{{vm.dashboard._id}}" class="btn btn-success" style="margin-right: 5px;" translate>Edit Dashboard</a>\n    </div>\n</div>\n\n<div class="container-fluid branded-border-panel"></div>\n\n<div class="container-fluid dashboard-container" id="pageViewer" style="top: 42px; bottom: 0; position: absolute; overflow-y: auto; width: 100%; padding-top: 10px;"></div>\n');}]);})();