(function(){'use strict';angular.module('app.dashboard-edit').run(['$templateCache', function($templateCache) {$templateCache.put('partials/dashboard-edit/dashboard-edit.component.html','<div ng-show="!reportInterface" id="parentIntro" class="explorer-main-container" >\n\n<div class="explorer-container">\n    <app-theme-link theme="selectedDashboard.theme"></app-theme-link>\n\n    <div class="explorer-header">\n        <a href="./" class="btn-home">\n            <i class="fa fa-home"></i>\n        </a>\n        <div class="explorer-header-title">\n            <h3 app-editable-text="selectedDashboard.dashboardName">{{ selectedDashboard.dashboardName }}</h3>\n        </div>\n\n        <div class="explorer-header-buttons btn-group">\n                <button type="button" class="btn btn-default" id="saveDashboardBtn" data-ng-click="saveDashboardAndStay()" translate>Save</button>\n                <button type="button" class="btn btn-default" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n                  <span class="caret"></span>\n                  <span class="sr-only">Toggle Dropdown</span>\n                </button>\n                <ul class="dropdown-menu">\n                  <li>\n                    <a id="saveAndPreviewDashboardBtn" data-ng-click="saveDashboardAndPreview()" translate>Save and preview</a>\n                    <a id="saveAndQuitDashboardBtn" data-ng-click="saveDashboardAndQuit()" translate>Save and quit</a>\n                  </li>\n                </ul>\n            <a ng-click="vm.goBack();" class="btn btn-default" uib-tooltip="{{\'Click here to cancel and backtrack\' | translate}}" tooltip-placement="bottom" translate>Cancel</a>\n        </div>\n\n    </div>\n\n\n    <div class="explorer-body">\n\n    <section page-block ndType="page" ng-show="!queryInterface" id="designArea" class="scrollPane multiPage rendered dashboard-container" style="padding: 10px;" app-drop-target=".Block500, #designArea" drop-accept="text/html" on-drop="vm.onDrop($event, dropTarget)" ng-mouseover="vm.onPageBlockMouseOver($event)">\n\n    </section>\n\n    <section id="objectPanel" class="dashboard-edit-object-panel" data-num-cols="4" ng-init="tabs.selected = \'reports\'">\n        <menu>\n            <li ng-class="{\'on\': tabs.selected == \'settings\'}">\n                <a ng-click="tabs.selected = \'settings\'">\n                    <i class="fa fa-gear"></i>\n                </a>\n            </li>\n            <li id="searchTabButton" class="search hand-cursor" ng-class="{\'on\': tabs.selected == \'reports\'}">\n                <a ng-click="tabs.selected = \'reports\'">\n                    <span class="objectPanel-menu-label" translate>Reports</span>\n                    <i class="fa fa-bar-chart fa-2" aria-hidden="true" style="margin-left: 0; margin-right: 5px;"> </i>\n                </a>\n            </li>\n            <li id="layoutTabButton" class="layout hand-cursor" ng-class="{\'on\': tabs.selected == \'prompts\'}" >\n                <a ng-click="tabs.selected = \'prompts\'">\n                    <span class="objectPanel-menu-label" translate>Run time filters</span>\n                    <i class="fa fa-filter fa-2" aria-hidden="true"></i>\n                </a>\n            </li>\n            <li id="layoutTabButton" class="layout hand-cursor" ng-class="{\'on\': tabs.selected == \'layouts\'}" >\n                <a ng-click="tabs.selected = \'layouts\'">\n                    <span class="objectPanel-menu-label" translate>Layouts</span>\n                    <i class="fa fa-file-image-o fa-2" aria-hidden="true"></i>\n                </a>\n            </li>\n        </menu>\n    <section class="content">\n\n        <section id="settingsTab" ng-show="tabs.selected == \'settings\'">\n                <form>\n                    <div class="form-group">\n                        <label translate>Theme</label>\n                        <app-theme-select theme="selectedDashboard.theme" on-change="selectedDashboard.theme = theme"></app-theme-select>\n                    </div>\n                    <div class="form-group">\n                        <label translate>Preview size</label>\n                        <input type="number" ng-model="selectedDashboardLimit.value" class="form-control">\n                        <div class="help-block" translate>This limits the number of rows fetched in order to get a preview quickly. Set to 0 to disable.</div>\n                    </div>\n                    <button ng-click="Redraw()" class="btn btn-sm btn-default">\n                      <i class="fa fa-refresh"></i>\n                      <span translate>Redraw</span>\n                    </button>\n                </form>\n\n                <app-inspector element="selectedElement" dashboard="selectedDashboard" on-change="onChangeElementProperties"></app-inspector>\n        </section>\n\n        <section id="reportsTab" ng-show="tabs.selected == \'reports\'">\n            <button class="btn btn-info btn-sm" ng-click="newReport()" translate>New Report</button>\n            <button class="btn btn-info btn-sm" ng-click="importReport()" translate>Import Report</button>\n\n            <div ng-repeat="item in selectedDashboard.reports" draggable="true" app-dragstart="vm.onReportDragStart($event, item)" id="{{item.id}}" ng-mouseenter="vm.onReportMouseEnter($event)" ng-mouseleave="vm.onReportMouseLeave($event)" class="dashboard-report-list-item" ng-class="{hovered: vm.hovered[item.id]}">\n                <span>\n                    <img draggable="false" ng-if="item.reportType == \'grid\'" src="images/grid.png" data-pin-nopin="true">\n                    <img draggable="false" ng-if="item.reportType == \'chart-line\'" src="images/chart_line.png" data-pin-nopin="true">\n                    <img draggable="false" ng-if="item.reportType == \'chart-donut\' || item.reportType == \'chart-pie\'" src="images/chart_donut.png" data-pin-nopin="true">\n                    <img draggable="false" ng-if="item.reportType == \'indicator\'" src="images/indicator.png" data-pin-nopin="true">\n                    <img draggable="false" ng-if="item.reportType == \'gauge\'" src="images/gauge.png" data-pin-nopin="true">\n                </span>\n\n                <div style="width: 100%;">\n                    <span app-editable-text="item.reportName" style="color: white;">{{ item.reportName }}</span>\n                    <br>\n                    <div class="btn-group btn-group-sm pull-right">\n                        <button class="btn btn-silver" ng-click="loadReport(item)" uib-tooltip="{{ \'Click here to edit this report\' | translate }}" tooltip-placement="bottom">\n                            <i class="fa fa-pencil"></i>\n                        </button>\n                        <button class="btn btn-silver" ng-click="vm.duplicateReport(item)" uib-tooltip="{{ \'Duplicate this report\' | translate }}" tooltip-placement="bottom">\n                            <i class="fa fa-copy"></i>\n                        </button>\n                        <button class="btn btn-danger" ng-click="deleteReport(item.id,item.reportName)" uib-tooltip="{{ \'Click here to delete this report\' | translate }}" tooltip-placement="bottom">\n                            <i class="fa fa-trash-o"></i>\n                        </button>\n                    </div>\n                </div>\n            </div>\n        </section>\n\n        <section id="promptsTab" ng-show="tabs.selected == \'prompts\'">\n            <div ng-repeat="prompt in getPrompts()" draggable="true" app-dragstart="vm.onFilterPromptDragStart($event, prompt)" style="margin-bottom: 5px; margin-top: 5px; display: flex; align-items: center; border: 1px white solid; border-radius: 5px;" id="{{item.id}}" class="dashboard-filter-prompt-item">\n                <span>\n                    <i class="fa fa-filter"></i>\n                    <i class="fa fa-question"></i>\n                </span>\n                {{ getColumnDescription(prompt) }}\n            </div>\n        </section>\n\n        <section id="resultsLayout" ng-show="tabs.selected == \'layouts\'">\n            <div class="searchLoaderHolder"></div>\n            <div class="searchGroup hasContent">\n                <div class="gallery infoPanelGallery templateGallery laidOut">\n\n                    <div>\n                        <div class="col-md-6" style="padding: 0; padding-right: 1px;">\n                            <div id="element-btn" draggable="true" app-dragstart="vm.onLayoutDragStart($event, \'paragraph\')">\n                                <i class="fa fa-paragraph"></i>\n                            </div>\n                        </div>\n                        <div class="col-md-6" style="padding: 0; padding-left: 1px;">\n                            <div id="element-btn" draggable="true" app-dragstart="vm.onLayoutDragStart($event, \'heading\')">\n                                <i class="fa fa-header"></i>\n                            </div>\n                        </div>\n                    </div>\n\n                    <div>\n                        <div class="col-md-6" style="padding: 0; padding-right: 1px;">\n                            <div id="element-btn" draggable="true" app-dragstart="vm.onLayoutDragStart($event, \'image\')">\n                                <i class="fa fa-picture-o"></i>\n\n                            </div>\n                        </div>\n                        <div class="col-md-6" style="padding: 0; padding-left: 1px;">\n                            <div id="element-btn" draggable="true" app-dragstart="vm.onLayoutDragStart($event, \'video\')">\n                                <i class="fa fa-play"></i>\n                            </div>\n                        </div>\n                    </div>\n\n                    <div data-color="jumbotron" effect-allowed="copy"  style="margin-bottom: 5px;" draggable="true" app-dragstart="vm.onLayoutDragStart($event, \'jumbotron\')">\n                        <img draggable="false" src="images/layout_jumbotron.png" style="width: 100%">\n                    </div>\n\n                    <div draggable="true" app-dragstart="vm.onLayoutDragStart($event, \'4colscta\')" style="margin-bottom: 5px;">\n                        <img draggable="false" src="images/layout_4cols_cta.png" style="width: 100%">\n                    </div>\n\n                    <div draggable="true" app-dragstart="vm.onLayoutDragStart($event, \'3colscta\')" style="margin-bottom: 5px;">\n                        <img draggable="false" src="images/layout_3cols_cta.png" style="width: 100%">\n                    </div>\n\n                    <div draggable="true" app-dragstart="vm.onLayoutDragStart($event, \'2colscta\')" style="margin-bottom: 5px;">\n                        <img draggable="false" src="images/layout_2cols_cta.png" style="width: 100%">\n                    </div>\n\n                    <div draggable="true" app-dragstart="vm.onLayoutDragStart($event, \'imageTextLarge\')" style="margin-bottom: 5px;">\n\n                        <img draggable="false" src="images/layout_block_image_text_large.png" style="width: 100%">\n                    </div>\n\n                    <div draggable="true" app-dragstart="vm.onLayoutDragStart($event, \'textImageLarge\')" style="margin-bottom: 5px;">\n                        <img draggable="false" src="images/layout_block_text_image_large.png" style="width: 100%">\n                    </div>\n\n                    <div draggable="true" app-dragstart="vm.onLayoutDragStart($event, \'divider\')" uib-tooltip="{{\'This divider defines a page-break for printing\'| translate}}" style="margin-bottom: 5px;">\n                        <img draggable="false" src="images/layout_featurete_divider.png" style="width: 100%">\n                    </div>\n\n                    <div draggable="true" app-dragstart="vm.onLayoutDragStart($event, \'pageHeader\')" style="margin-bottom: 5px;">\n                        <img draggable="false" src="images/layout-page-header.png" style="width: 100%">\n                    </div>\n                </div>\n            </div>\n        </section>\n\n    </section>\n\n        <div class="arrow-right" id="color-picker-arrow"></div>\n        <div class="arrow-right" id="background-arrow"></div>\n\n    </section>\n</div>\n    </div>\n</div>\n\n<div ng-show="reportInterface" id="reportModal" ng-controller="ReportEditController" ng-include src="reportModal"></div>\n\n<nd-modal id="dashboardNameModal">\n    <div class="modal-body">\n        <form class="simple-form" role="form" name="dashboardForm">\n            <div class="form-group">\n                <label translate>Dashboard Name</label>\n                <input name="dashboardName" type="text" class="form-control" ng-model="selectedDashboard.dashboardName" ng-required="true" required >\n                <span ng-show="dashboardForm.dashboardName.$invalid" class="help-inline" translate>The dashboard name is required</span>\n            </div>\n        </form>\n    </div>\n    <div class="modal-footer">\n        <button ng-click="dashboardNameSave()" ng-disabled="reportForm.$invalid" class="btn btn-primary submit-btn pull-right" translate>Save</button>\n        <button type="button" class="btn pull-right" data-dismiss="modal" translate>Cancel</button>\n    </div>\n</nd-modal>\n\n<div id="previewContainer" ng-show="false"></div>\n');
$templateCache.put('partials/dashboard-edit/dashboard-edit.dashboard-image-modal.component.html','<div class="modal-header">\n    <button type="button" class="close" ng-click="vm.dismiss()" aria-hidden="true">&times;</button>\n    <h3 class="modal-title" translate>Select an image</h3>\n</div>\n\n<div class="modal-body">\n    <uib-tabset class="nav-tabs-justified">\n        <uib-tab heading="{{ \'My Images\' | translate }}">\n            <ul id="file-list" class="files-modal-list">\n                <li ng-repeat="file in vm.files">\n                    <a class="hand-cursor file-selection" ng-hide="file.loading" ng-click="vm.onFileSelected(file)">\n                        <img alt="{{ file.description }}" uib-tooltip="{{ file.name }}" ng-src="{{ file.url }}" />\n                    </a>\n                    <a class="hand-cursor file-selection" ng-show="file.loading">\n                        <img src="images/loader.gif" />\n                    </a>\n                </li>\n            </ul>\n\n            <div class="btn btn-default" ngf-select="vm.upload($file)" translate>Choose image to upload</div>\n        </uib-tab>\n\n        <uib-tab heading="{{ \'Public Images\' | translate }}">\n            <ul class="files-modal-list">\n                <li ng-repeat="file in vm.catalogImages">\n                    <a class="hand-cursor file-selection" ng-click="vm.onFileSelected(file)">\n                        <img ng-src="{{ file.url }}" />\n                    </a>\n                </li>\n            </ul>\n        </uib-tab>\n\n        <uib-tab heading="{{ \'Icon set\' | translate }}">\n            <ul class="files-modal-list">\n                <li ng-repeat="file in vm.catalogIcons">\n                    <a class="hand-cursor file-selection" ng-click="vm.onFileSelected(file)">\n                        <img ng-src="{{ file.url }}" />\n                    </a>\n                </li>\n            </ul>\n        </uib-tab>\n\n        <uib-tab heading="{{ \'Image URL\' | translate }}">\n            <div class="form-group">\n                <label> URL </label>\n                <input type="text" class="form-control" ng-model="vm.url" name="URL" placeholder="Image URL" size="40">\n            </div>\n            <button type="submit" class="btn btn-default" ng-click="vm.submit()"> Submit </button>\n            <img class="img-responsive" alt="Preview of image URL" ng-src="{{ vm.url }}" />\n        \n        </uib-tab>\n\n    </uib-tabset>\n</div>\n     \n');
$templateCache.put('partials/dashboard-edit/dashboard-edit.reports-import-modal.component.html','<div class="modal-header">\n    <button type="button" class="close" ng-click="vm.dismiss()" aria-hidden="true"><i class="fa fa-close"></i></button>\n    <h4 translate>Choose a report to add to the dashboard</h4>\n</div>\n\n<div class="modal-body">\n    <app-reports-table on-select="vm.close({ $value: $report._id })" hide-buttons="true"></app-reports-table>\n</div>\n\n<div class="modal-footer">\n    <button type="button" class="btn btn-white" ng-click="vm.dismiss()" translate>Cancel</button>\n</div>\n');}]);})();