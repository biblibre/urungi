(function(){'use strict';angular.module('app.layer-edit').run(['$templateCache', function($templateCache) {$templateCache.put('partials/layer-edit/layer-edit.component.html','<div class="explorer-main-container">\n\n    <div class="explorer-container">\n\n        <div class="explorer-header">\n            <a href="./" class="btn-home">\n                <i class="fa fa-home"></i>\n            </a>\n            <div class="explorer-header-title">\n                <h3 app-editable-text="_Layer.name">{{ _Layer.name }}</h3>\n            </div>\n            <div class="explorer-header-buttons btn-group">\n                <div>\n                    <button type="button" class="btn btn-default" ng-click="saveLayerAndStay()" translate>Save layer</button>\n                </div>\n                <button type="button" class="btn btn-default" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n                    <span class="caret"></span>\n                    <span class="sr-only">Toggle Dropdown</span>\n                </button>\n                <ul class="dropdown-menu">\n                    <li>\n                        <a ng-click="saveLayerAndQuit()" translate>Save and quit</a>\n                    </li>\n                </ul>\n                <a href="layers" class="btn btn-default pull-right" translate>Cancel</a>\n            </div>\n        </div>\n\n\n        <div class="explorer-body" ng-init="view()" style="background-position: -25px -1px; background-image: url(&quot;data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIzNCIgaGVpZ2h0PSIzNCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDguNSBMIDM0IDguNSBNIDguNSAwIEwgOC41IDM0IE0gMCAxNyBMIDM0IDE3IE0gMTcgMCBMIDE3IDM0IE0gMCAyNS41IEwgMzQgMjUuNSBNIDI1LjUgMCBMIDI1LjUgMzQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UwZTBlMCIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNIDM0IDAgTCAwIDAgMCAzNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=&quot;);">\n\n\n\n\n\n            <section id="objectPanel" ng-init="tabs.selected = \'elements\'" class="catalogSidebar">\n                <menu>\n                    <li class="search hand-cursor" ng-class="{\'on\': tabs.selected === \'properties\'}">\n                        <a ng-click="tabs.selected = \'properties\'">\n                            <i class="fa fa-gear"></i>\n                        </a>\n                    </li>\n                    <li id="searchTabButton" class="search hand-cursor" ng-class="{\'on\': tabs.selected == \'elements\'}">\n                        <a  ng-click="tabs.selected = \'elements\'">\n                            <span class="objectPanel-menu-label" translate>Layer elements</span>\n                            <i class="fa fa-newspaper-o fa-2" aria-hidden="true"></i><!--<br/>Layer<br/>Elements-->\n                        </a>\n                    </li>\n                    <li id="sourcesTabButton" class="search hand-cursor" ng-class="{\'on\': tabs.selected == \'sources\'}">\n                        <a  ng-click="tabs.selected = \'sources\'">\n                            <span class="objectPanel-menu-label" translate>Sources</span>\n                            <i class="fa fa-plug fa-2" aria-hidden="true"></i>\n                        </a>\n                    </li>\n                    <li id="queriesTabButton" class="search hand-cursor" ng-class="{\'on\': tabs.selected == \'queries\'}">\n                        <a  ng-click="tabs.selected = \'queries\'">\n                            <span class="objectPanel-menu-label" translate>Queries</span>\n                            <i class="fa fa-map fa-2" aria-hidden="true"></i> <!--<br/>SQL<br/> Queries-->\n                        </a>\n                    </li>\n                </menu>\n\n                <section class="content" >\n                    <section id="propertiesTab" class="results infinite ng-hide" ng-show="tabs.selected == \'properties\'" style="padding: 5px;">\n                            <!--<h5 class="pull-right">Properties</h5>-->\n\n                        <layer-edit-object-properties object-type="selectedItem" object="theSelectedElement" on-delete="deleteObject()" on-edit="editObject"\n                        layer="_Layer" on-delete-element="deleteSchemaElement" on-publish-element="elementAdd"></layer-edit-object-properties>\n\n                    </section>\n\n                    <section id="elementsTab" class="results infinite layer-elements ng-hide " ng-show="tabs.selected == \'elements\'">\n\n                        <div class="container-fluid">\n                            <div id="layerButtonGroup" class="btn-group">\n                                <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n                                    <span translate>Create</span>\n                                    <span class="caret"></span>\n                                </button>\n                                <ul class="dropdown-menu layerNewButtonDropdown">\n                                    <li><a href="" ng-click="addFolder()" translate>New Folder</a></li>\n                                    <li><a href="" ng-click="createComposedElement()" translate>New Element</a></li>\n                                </ul>\n                            </div>\n                        </div>\n\n\n                        <section class="layer scrollPane">\n\n                            <div    class="layer-elements-tree">\n                                <ng-include src="\'nestable_item.html\'"></ng-include>\n\n                                <script type="text/ng-template" id="nestable_item.html">\n                                    <!--<layer-element element="rootItem" on-element-edit-click="editElement" on-element-delete-click="deleteSchemaElement"></layer-element>-->\n                                <div>\n\n\n\n                                       <div class="schema-element"  ng-if="rootItem.elementRole == \'dimension\' || rootItem.elementRole == \'measure\'" >\n                                           <i class="fa fa-cube wst-main-color" ng-show="rootItem.elementType != \'date\' && rootItem.elementType != \'number\' && rootItem.elementType != \'count\' && (!rootItem.defaultAggregation)" data-toggle="tooltip" data-placement="top" title="{{rootItem.elementLabel}} (Dimmension)"></i>\n                                                        <i class="fa fa-reorder wst-main-color" ng-show="rootItem.elementType == \'number\' || rootItem.elementType == \'count\' || (rootItem.elementType == \'string\' && rootItem.defaultAggregation)" data-toggle="tooltip" data-placement="top" title="{{rootItem.elementLabel}} (Metric)"></i>\n                                                        <i class="fa fa-calendar-o wst-main-color" ng-show="rootItem.elementType == \'date\'" data-toggle="tooltip" data-placement="top"></i>\n                                           <span ng-if="!rootItem.editing == true" title="{{rootItem.description}}">{{rootItem.elementLabel}}</span>\n                                           <i class="fa fa-wrench" style="color:#999999" ng-show="rootItem.isCustom"></i>\n                                           <div ng-if="!rootItem.editing == true" class="schema-element-btn">\n                                                <div class="btn btn-warning btn-xs delete-schema-element-btn" ng-click="deleteSchemaElement(rootItem)" translate>Remove</div>\n                                                <div class="btn btn-info btn-xs edit-schema-element-btn" ng-click="editElement(rootItem)" translate>Edit</div>\n                                            </div>\n\n\n                                        </div>\n\n                                        <div class="schema-folder"  ng-if="rootItem.elementRole == \'folder\'" >\n                                           <i class="fa fa-caret-down"></i>\n                                            <span ng-if="!rootItem.editing == true" class="" >{{rootItem.elementLabel}}</span>\n                                            <span ng-if="rootItem.editing == true" class=""><input type="text" ng-model="rootItem.elementLabel" style="width:100px"></span>\n\n                                            <div ng-if="!rootItem.editing == true" class="schema-element-btn">\n                                                <div class="btn btn-danger btn-xs delete-schema-element-btn" ng-click="deleteSchemaElement(rootItem)" translate>Delete</div>\n                                                <div class="btn btn-info btn-xs edit-schema-element-btn" ng-click="rootItem.editing = true" translate>Edit</div>\n                                            </div>\n\n                                            <div ng-if="rootItem.editing == true" class="edit-schema-element-btn pull-right" ng-click="rootItem.editing = false" style="cursor:hand"><i class="fa fa-floppy-o save-folder-element-btn-icon" uib-tooltip="{{\'Save folder label\' | translate}}"></i></div>\n                                        </div>\n                                        <ul ng-if="rootItem.elementRole == \'folder\' || rootItem.elementRole == \'root\'" class="schema-container list-group" ui-sortable="sortableOptions" ng-model="rootItem.elements"\n                                            ng-class="{\'schema-element-container-placeholder\': onDrag, \'schema-element-container-default\': !onDrag}">\n                                            <li class="innerCont list-group-item hand-cursor" ng-repeat="rootItem in rootItem.elements" >\n                                                <ng-include src="\'nestable_item.html\'"></ng-include>\n                                            </li>\n                                        </ul>\n                                    </div>\n                                </script>\n                             </div>\n\n                        </section>\n                        <div class="scrollTrack vScrollTrack">\n                            <div class="scrollThumb" style="height: 72px; transform: translateY(0);"></div>\n                        </div>\n                        <div class="scrollTrack hScrollTrack">\n                            <div class="scrollThumb disabled" style="width: 354px; transform: translateX(0);"></div>\n                        </div>\n                    </section>\n\n            <section id="sourcesTab" class="results infinite ng-hide" ng-show="tabs.selected == \'sources\'">\n                <section class="layer scrollPane">\n\n                    <div class="container-fluid" style="min-height: 100%;">\n                        <div ui-tree data-nodrop-enabled="true" data-drag-enabled="false">\n                          <ol ui-tree-nodes="" ng-model="datasources">\n                            <li  ng-repeat="item in datasources" ui-tree-node>\n                              <div ui-tree-handle class="layer-tree-datasource selected-datasource" style="cursor: pointer;">\n                                    <i ng-if="!item.isCollapsed" ng-click="getDatasetsForThisDts(item._id,item)" class="fa fa-plus-square"></i>\n                                    <i ng-if="item.isCollapsed" class="fa fa-minus-square" ng-click="item.isCollapsed = !item.isCollapsed" ></i>\n\n\n                                  <span ng-disabled="item.loading || item.status == -1" ng-click="getDatasetsForThisDts(item._id,item)">{{item.name}}</span>\n\n                                    <i ng-if="(item.status == -1 || item.entities ) && !item.loading" class="fa fa-refresh" ng-click="getDatasetsForThisDts(item._id,item)" style="color: #eee; font-size: 16px;"></i>\n\n                                        <div id="fountainG" ng-if="item.loading">\n                                            <div id="fountainG_1" class="fountainG"></div>\n                                            <div id="fountainG_2" class="fountainG"></div>\n                                            <div id="fountainG_3" class="fountainG"></div>\n                                            <div id="fountainG_4" class="fountainG"></div>\n                                            <div id="fountainG_5" class="fountainG"></div>\n                                            <div id="fountainG_6" class="fountainG"></div>\n                                            <div id="fountainG_7" class="fountainG"></div>\n                                            <div id="fountainG_8" class="fountainG"></div>\n                                        </div>\n\n\n                              </div>\n                                      <ol  ui-tree-nodes="" ng-model="item.entities">\n                                        <li ng-repeat="collectionName in item.entities" ui-tree-node>\n                                          <div ui-tree-handle class="layer-tree-datasource-collection" style="font-weight: 100;">\n                                            <table style="width: 100%; cursor: default;">\n                                                <tr style="width: 100%;">\n                                                    <td>\n                                                        <i class="fa fa-table" aria-hidden="true"></i>\n                                                    </td>\n                                                    <td class="layer-tree-td-name">\n                                                        {{ collectionName }}\n                                                    </td>\n                                                    <td>\n                                                        <button type="button" ng-click="addDatasetToLayer(item._id, collectionName)" class="btn btn-info btn-xs add-to-layer-btn" translate>Add</button>\n                                                    </td>\n                                                </tr>\n                                              </table>\n                                          </div>\n                                        </li>\n                                      </ol>\n                            </li>\n                          </ol>\n                        </div>\n\n                     </div>\n\n                </section>\n                <div class="scrollTrack vScrollTrack">\n                    <div class="scrollThumb" style="height: 72px; transform: translateY(0);"></div>\n                </div>\n                <div class="scrollTrack hScrollTrack">\n                    <div class="scrollThumb disabled" style="width: 354px; transform: translateX(0);"></div>\n                </div>\n            </section>\n            <section id="queriesTab" class="results infinite ng-hide" ng-show="tabs.selected == \'queries\'" style="padding: 5px;">\n                    <a ng-click="addSQL()" class="btn btn-info pull-right" style="margin-left: 5px; margin-right: 5px;" translate>Add SQL</a>\n                <div ng-if="collection.sql" ng-repeat="collection in _Layer.params.schema">{{collection.collectionName}}</div>\n            </section>\n                </section>\n            </section>\n\n\n\n\n            <div id="collections" class="canvas-parent" ng-click="selectedCanvas($event)" style="left: 300px;">\n            <div  class="canvas canvas-wide flowchart-demo jtk-surface jtk-surface-nopan canvas-er" id="canvas" style="cursor: default;">\n\n                <div id="{{collection.collectionID}}-parent"  class="window jtk-node  jsplumb-draggable" ng-style="{\'left\': collection.left, \'top\': collection.top}"\n                ng-repeat="collection in _Layer.params.schema">\n\n\n                    <div id="{{collection.collectionID}}" class=" jtk-header " style="overflow: hidden; padding-left: 2px;">\n                        <div class="row">\n                            <span class="col-md-1 jtk-field-icon" style="color: white;"><i ng-show="!element.elementRole" class="fa fa-database"></i></span>\n\n                            <span class="col-md-6 jtk-header-label" style="overflow: hidden; text-align: left;" ng-click="selectCollection(collection,$event)">\n                                {{collection.collectionName}}\n                            </span>\n\n                            <span class="col-md-4">\n                                <span ng-click="toggleFolded(collection)" >\n                                    <i ng-hide="collection.folded" class="jtk-field-selected fa fa-minus-square"></i>\n                                    <i ng-show="collection.folded" class="jtk-field-selected fa fa-plus-square"></i>\n                                </span>\n\n                                <span>\n                                    <i ng-hide="allElementsAdded(collection)" class="jtk-field-icon fa fa-plus-square" ng-click="promptAddAll(collection)" uib-tooltip="{{ \'Add all\' | translate }}" ></i>\n                                    <i ng-show="allElementsAdded(collection)" class="jtk-field-selected fa fa-check-square" ></i>\n                                </span>\n                            </span>\n                        </div>\n\n                    </div>\n\n\n\n                    <div class="jtk-field" id="{{element.elementID}}" \n                    ng-repeat="element in collection.elements"  title="{{element.elementName}}" data-html="true" rel="tooltip" \n                    ng-class="{\'isPK\': element.isPK}" ng-click="selectElement(element,$event)" ng-hide="collection.folded && !isInAJoin(element)">\n\n                        <table style="border: 0;">\n                            <tr>\n                                <td class="jtk-field-icon"><i ng-show="!element.elementRole" class="fa fa-plus-square" ng-click="elementAdd(element)" ></i></td>\n                                <td class="jtk-field-icon"><i ng-show="element.count" class="fa fa-superscript element-variable"  ></i></td>\n                                <td class="jtk-field-selected"><i ng-show="element.elementRole" class="fa fa-check-square"  ></i></td>\n\n                                <td class="jtk-field-label" ng-class="{\'field-selected\': element.elementRole}">{{element.elementName}}</td>\n                            </tr>\n\n                        </table>\n\n\n                    </div>\n                </div>\n            </div>\n        </div>\n        </div>\n    </div>\n</div>\n');
$templateCache.put('partials/layer-edit/layer-edit.object-properties.directive.html','<div id="layerObjectProperties">\n        <div class="container-fluid tool-set" ng-if="objectType != \'layer\' && objectType != \'\' && objectType != undefined">\n            <div class="container-fluid">\n                    <span ng-if="objectType == \'join\'" translate>Join</span>\n                    <span ng-if="objectType == \'collection\'" translate>Dataset</span>\n                    <span ng-if="objectType == \'element\'" translate>Element</span>\n                    <button ng-if="objectType != \'element\'" type="button" class="btn btn-danger pull-right"  ng-click="delete()" translate>Delete</button>\n                    <button ng-if="objectType == \'collection\' && object.isSQL" type="button" class="btn pull-right query-edit-btn"  ng-click="onEdit()" translate>Edit</button>\n                    <button ng-if="!object.elementRole && objectType == \'element\'" type="button" class="btn btn-success pull-right" ng-click="publishElement()" data-toggle="tooltip" data-placement="bottom" title="{{ \'Add to layer elements\' | translate }}">+</button>\n                    <button ng-if="object.elementRole && objectType == \'element\'" type="button" class="btn btn-warning pull-right" ng-click="removeElement()" data-toggle="tooltip" data-placement="bottom" title="{{ \'Remove from layer elements\' | translate }}">-</button>\n\n            </div>\n        </div>\n\n\n<div class="container-fluid main">\n\n\n   <div class="container-fluid" ng-if="objectType == \'\' || objectType == undefined">\n            <br/>\n            <br/>\n            <span translate>No Selection</span>\n        </div>\n\n<div ng-if="objectType == \'collection\'">\n<div class="container-fluid main-properties-container">\n        <div class="row">\n            <div class="col-md-6">\n                <div class="form-group">\n                    <label for="field-3" class="control-label properties" translate>Name</label>\n                    <input id="field-3" class="form-control" ng-model="object.collectionName" required>\n                </div>\n            </div>\n\n            <div class="col-md-6">\n                <div class="form-group">\n                    <label for="field-3" class="control-label properties" translate>Label</label>\n                    <input id="field-3" class="form-control" ng-model="object.collectionLabel" required>\n                </div>\n            </div>\n        </div>\n\n        <div class="row">\n            <div class="col-md-12">\n                <div class="form-group">\n                    <label for="field-5" class="control-label properties" translate>Description</label>\n                    <textarea ng-model="object.description" class="form-control autogrow" id="field-5"  style="overflow: hidden; word-wrap: break-word; resize: horizontal; height: 50px;"></textarea>\n                </div>\n            </div>\n        </div>\n\n        <div class="row" ng-if="object.sqlQuery">\n            <div class="col-md-12">\n                <div class="form-group">\n                    <label for="field-5" class="control-label">SQL</label>\n                    <textarea ng-model="object.sqlQuery" class="form-control autogrow" id="field-5"></textarea>\n                </div>\n            </div>\n        </div>\n\n    </div>\n</div>\n\n<div ng-if="objectType == \'element\'">\n    <div class="container-fluid tab-container">\n        <div class="row" >\n            <div class="col-md-12">\n                <div class="form-group">\n                    <label  class="control-label properties" translate>Name</label>\n                    <input type="text" class="form-control" placeholder="{{object.elementName}}" disabled="">\n                </div>\n            </div>\n        </div>\n\n        <div class="row" >\n            <div class="col-md-12">\n                <div class="form-group">\n                    <label  class="control-label properties" translate>Label</label>\n                    <input type="text" class="form-control" ng-model="object.elementLabel">\n                </div>\n            </div>\n        </div>\n\n        <div class="row" >\n            <div class="col-md-6">\n                <div class="form-group">\n                    <label for="field-4" class="control-label" translate>Type</label>\n                    <select id="field-4" class="form-control ng-pristine ng-untouched ng-valid ng-not-empty" ng-model="object.elementType" ng-options="type for type in elementTypes"></select>\n                </div>\n            </div>\n\n            <div class="col-md-6" ng-if="object.elementType != \'number\'">\n                <div class="form-group">\n                    <label for="field-4" class="control-label" translate>Default Aggregation</label>\n                    <select  id="field-4b" class="form-control ng-pristine ng-untouched ng-valid ng-empty" ng-model="object.defaultAggregation" ng-options="obj.value as obj.name for obj in stringDefaultAggregation"></select>\n                </div>\n            </div>\n\n            <div class="col-md-6" ng-if="object.elementType == \'number\'">\n                <div class="form-group">\n                    <label for="field-4" class="control-label" translate>Default Aggregation</label>\n                    <select  id="field-4b" class="form-control ng-pristine ng-untouched ng-valid ng-empty" ng-model="object.defaultAggregation" ng-options="obj.value as obj.name for obj in numberDefaultAggregation"></select>\n                </div>\n            </div>\n        </div>\n\n        <div class="row" ng-if="object.elementType == \'number\' || selectedElement.elementType == \'date\'">\n            <div class="col-md-12">\n                <div class="form-group">\n                    <label  class="control-label properties" translate>Format</label>\n                    <input type="text" class="form-control" ng-model="object.format" placeholder="{{ \'format...\' | translate }}">\n                    <p class="help-block"><a class="pull-right" href="http://numeraljs.com/" target="_blank" translate>More Info</a></p>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n\n<div ng-if="objectType == \'join\'">\n    <div class="container-fluid main-properties-container">\n                <div class="row" style="margin-top: 20px;">\n                    <div class="col-md-12">\n                            <label  class="control-label properties" translate>Source</label>\n                        <input type="text" class="form-control" placeholder="{{object.sourceCollectionName+\'.\'+object.sourceElementName}}" disabled="">\n                    </div>\n                </div>\n                <div class="row" style="margin-top: 20px;">\n                    <div class="col-md-12">\n                            <label  class="control-label properties" translate>Target</label>\n                            <input type="text" class="form-control" placeholder="{{object.targetCollectionName+\'.\'+object.targetElementName}}" disabled="">\n\n                    </div>\n                </div>\n                 <div class="row" style="margin-top: 20px;">\n                    <div class="col-md-12">\n                            <label  class="control-label properties" translate>Join type</label>\n                                <div class="btn-group btn-group-justified" style="width: 100%;">\n                                    <a type="button" class="btn btn-sm" ng-class="{\'btn-info\': object.joinType == \'left\',\'btn-white\': object.joinType != \'left\'}"   ng-click="changeJoinType(\'left\')" translate>Left</a>\n\n                                    <a type="button" class="btn btn-sm" ng-class="{\'btn-info\': object.joinType == \'default\',\'btn-white\': object.joinType != \'default\'}"  ng-click="changeJoinType(\'default\')" translate>Inner</a>\n\n                                    <a type="button" class="btn btn-sm" ng-class="{\'btn-info\': object.joinType == \'right\',\'btn-white\': object.joinType != \'right\'}"  ng-click="changeJoinType(\'right\')" translate>Right</a>\n                                </div>\n\n                    </div>\n                </div>\n\n    </div>\n\n</div>\n\n\n<div ng-if="objectType == \'layer\'">\n    <div class="container-fluid main-properties-container">\n        <div class="row">\n            <div class="col-md-12">\n                <div class="form-group">\n                    <label for="field-3" class="control-label properties" translate>Layer Name</label>\n                    <input id="field-3" class="form-control" ng-model="object.name" required>\n                </div>\n            </div>\n        </div>\n\n\n        <div class="row">\n            <div class="col-md-12">\n                <div class="form-group">\n                    <label for="field-5" class="control-label properties" translate>Description</label>\n                    <textarea ng-model="object.description" class="form-control autogrow" id="field-5"></textarea>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n\n</div>\n\n</div>\n');}]);})();