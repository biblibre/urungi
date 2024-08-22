/* global jsPlumb: false */
(function () {
    'use strict';

    angular.module('app.layer-edit')
        .controller('LayerEditController', LayerEditController)
        .component('appLayerEdit', {
            templateUrl: 'partials/layer-edit/layer-edit.component.html',
            controller: 'LayerEditController',
            controllerAs: 'vm',
            bindings: {
                layerId: '@',
            }
        });

    LayerEditController.$inject = ['$scope', '$timeout', '$window', '$uibModal', 'i18n', 'api', 'notify', 'layerEditService'];

    function LayerEditController ($scope, $timeout, $window, $uibModal, i18n, api, notify, layerEditService) {
        const vm = this;
        $scope.items = [];
        $scope.datasources = [];

        $scope.initiated = false;

        $scope.rootItem = { elementLabel: '', elementRole: 'root', elements: [] };

        $scope.deletingJoin = false;
        $scope.quitAfterSave = false;

        if ($window.location.hash === '#intro') {
            $timeout(function () { $scope.showIntro(); }, 1000);
        }

        $scope.IntroOptions = {
            // IF width > 300 then you will face problems with mobile devices in responsive mode
            steps: [

            ]
        };

        const connectorPaintStyle = {
            strokeWidth: 4,
            stroke: '#61B7CF',
            joinstyle: 'round',
            outlineStroke: 'white',
            outlineWidth: 2
        };
        const connectorHoverStyle = {
            strokeWidth: 4,
            stroke: '#216477',
            outlineWidth: 2,
            outlineStroke: 'white'
        };
        const endpointHoverStyle = {
            fill: '#000000',
            stroke: '#000000' // stroke: "#216477"
        };

        // the definition of source endpoints (the small blue ones)
        const sourceEndpoint = {
            endpoint: 'Dot',
            paintStyle: {
                stroke: '#7AB02C',
                fill: 'transparent',
                radius: 6,
                strokeWidth: 3
            },
            isSource: true,
            connector: ['Flowchart', { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }],
            connectorStyle: connectorPaintStyle,
            hoverPaintStyle: endpointHoverStyle,
            connectorHoverStyle,
            maxConnections: -1,
            dragOptions: {},
            overlays: [
                ['Label', {
                    location: [0.5, 1.5],
                    label: '',
                    cssClass: 'endpointSourceLabel'
                }]
            ]
        };

        // the definition of target endpoints (will appear when the user drags a connection)
        const targetEndpoint = {
            endpoint: 'Dot',
            paintStyle: { fill: '#7AB02C', radius: 6 },
            hoverPaintStyle: endpointHoverStyle,
            maxConnections: -1,
            dropOptions: { hoverClass: 'hover', activeClass: 'active' },
            isTarget: true,
            overlays: [
                ['Label', { location: [0.5, -0.5], label: '', cssClass: 'endpointTargetLabel' }]
            ]
        };

        const _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
            const newEndpoints = [];
            for (let i = 0; i < sourceAnchors.length; i++) {
                const sourceUUID = toId + sourceAnchors[i];

                const nedp = instance.addEndpoint(toId, sourceEndpoint, {
                    anchor: sourceAnchors[i], uuid: sourceUUID
                });
                newEndpoints.push(nedp.getUuid());
            }
            for (let j = 0; j < targetAnchors.length; j++) {
                const targetUUID = toId + targetAnchors[j];

                const nedp = instance.addEndpoint(toId, targetEndpoint, {
                    anchor: targetAnchors[j], uuid: targetUUID
                });
                newEndpoints.push(nedp.getUuid());
            }
            return newEndpoints;
        };

        function setDraggable (targetID) {
            instance.draggable(document.querySelectorAll(targetID), {

                drag: function (e) {
                    // Your code comes here
                    jsPlumb.repaint($(this));
                },
                stop: function (event, ui) {
                    if (typeof ui.position !== 'undefined') {
                        let pos_x = ui.position.left;
                        let pos_y = ui.position.top;

                        if (pos_x < 0) { pos_x = 0; }

                        if (pos_y < 0) { pos_y = 0; }

                        const parentId = $(this).attr('id');

                        const id = parentId.replace('-parent', '');

                        for (const c in $scope._Layer.params.schema) {
                            if ($scope._Layer.params.schema[c].collectionID === id) {
                                $scope._Layer.params.schema[c].left = pos_x;
                                $scope._Layer.params.schema[c].top = pos_y;
                            }
                        }
                    }
                }
            });
        }

        $scope.view = function () {
            if (vm.layerId) {
                api.getLayer(vm.layerId).then(function (layer) {
                    $scope._Layer = layer;
                    $scope.rootItem.elements = $scope._Layer.objects;

                    getDatasources();

                    if ($scope._Layer.params) {
                        $scope.erDiagramInit();
                    } else {
                        $scope._Layer.params = {};
                        $scope._Layer.params.schema = [];
                    }
                });
            };
        };

        $scope.save = function () {
            const theLayer = $scope._Layer;

            $scope.calculateComponents();

            // clean up

            for (const collection in theLayer.params.schema) {
                for (const element in theLayer.params.schema[collection].elements) {
                    if (theLayer.params.schema[collection].elements[element].painted) { theLayer.params.schema[collection].elements[element].painted = false; }
                }
            }

            for (const join in theLayer.params.joins) {
                theLayer.params.joins[join].connection = undefined;
            }

            api.replaceLayer(theLayer).then(function () {
                if ($scope.quitAfterSave) {
                    $window.location.href = 'layers';
                }
            }).then(() => {
                notify.success(i18n.gettext('Layer saved successfully'));
            }).catch(() => {
                notify.error(i18n.gettext('Something went wrong, check the server logs'));
            });
        };

        $scope.saveLayerAndStay = function () {
            $scope.quitAfterSave = false;
            $scope.save();
        };

        $scope.saveLayerAndQuit = function () {
            $scope.quitAfterSave = true;
            $scope.save();
        };

        function getDatasources () {
            api.getDatasource($scope._Layer.datasourceID).then(function (datasource) {
                $scope.datasources = [datasource];
            });
        };

        $scope.addSQL = function () {
            const modal = $uibModal.open({
                component: 'appLayerEditSqlModal',
                resolve: {
                    layer: () => $scope._Layer,
                    mode: () => 'add',
                },
            });

            modal.result.then(function (collection) {
                if (!$scope._Layer.params) { $scope._Layer.params = {}; }
                if (!$scope._Layer.params.schema) { $scope._Layer.params.schema = []; }

                $scope._Layer.params.schema.push(collection);

                setTimeout(function () {
                    for (const element in collection.elements) {
                        if (!collection.elements[element].painted) {
                            _addEndpoints(collection.elements[element].elementID, ['RightMiddle'], ['LeftMiddle']);
                        }
                    }
                    setDraggable('#' + collection.collectionID + '-parent');
                }, 100);

                $scope.erDiagramInit();
            }, function () {});
        };

        $scope.editSQL = function () {
            const selectedCollection = $scope.theSelectedElement;
            if (!selectedCollection.isSQL) {
                notify.error(i18n.gettext('Cannot modify sql of an object which is not an sql request'));
                return;
            }

            const modal = $uibModal.open({
                component: 'appLayerEditSqlModal',
                resolve: {
                    layer: () => $scope._Layer,
                    mode: () => 'edit',
                    collection: () => selectedCollection,
                    sqlQuery: () => selectedCollection.sqlQuery,
                    name: () => selectedCollection.collectionName,
                },
            });

            modal.result.then(function (collection) {
                selectedCollection.sqlQuery = collection.sqlQuery;

                $scope._Layer.objects = $scope._Layer.objects.filter(function f (object) {
                    if (object.collectionID === selectedCollection.collectionID) {
                        return collection.elements.some(e => e.elementID === object.elementID);
                    }

                    if (Array.isArray(object.elements)) {
                        object.elements = object.elements.filter(f);
                    }

                    return true;
                });
                $scope.rootItem.elements = $scope._Layer.objects;

                selectedCollection.elements = collection.elements;
            }, function () {});
        };

        $scope.setSelectedEntity = function (entity) {
            if ($scope.selectedEntities.indexOf(entity) === -1) {
                $scope.selectedEntities.push(entity);
            } else {
                const index = $scope.selectedEntities.indexOf(entity);
                $scope.selectedEntities.splice(index, 1);
            }
        };

        function makeJoin (sourceID, targetID) {
            if (!$scope._Layer.params.joins) { $scope._Layer.params.joins = []; }

            let found = false;
            // First verify that the join does not exists
            for (const j in $scope._Layer.params.joins) {
                if ($scope._Layer.params.joins[j].sourceElementID === sourceID && $scope._Layer.params.joins[j].targetElementID === targetID) {
                    found = true;
                }
            }

            if (!found) {
                const join = {};
                join.joinID = 'J' + layerEditService.newID($scope._Layer);

                for (const collection in $scope._Layer.params.schema) {
                    for (const element in $scope._Layer.params.schema[collection].elements) {
                        if ($scope._Layer.params.schema[collection].elements[element].elementID === sourceID) {
                            join.sourceElementID = $scope._Layer.params.schema[collection].elements[element].elementID;
                            join.sourceElementName = $scope._Layer.params.schema[collection].elements[element].elementName;
                            join.sourceCollectionID = $scope._Layer.params.schema[collection].collectionID;
                            join.sourceCollectionName = $scope._Layer.params.schema[collection].collectionName;
                        }

                        if ($scope._Layer.params.schema[collection].elements[element].elementID === targetID) {
                            join.targetElementID = $scope._Layer.params.schema[collection].elements[element].elementID;
                            join.targetElementName = $scope._Layer.params.schema[collection].elements[element].elementName;
                            join.targetCollectionID = $scope._Layer.params.schema[collection].collectionID;
                            join.targetCollectionName = $scope._Layer.params.schema[collection].collectionName;
                        }
                    }
                }

                if (join.sourceElementID && join.sourceCollectionID && join.targetElementID && join.targetCollectionID) {
                    join.joinType = 'default';
                    $scope._Layer.params.joins.push(join);
                }
            }
        }

        function deleteJoin (sourceID, targetID) {
            if (!$scope._Layer.params.joins) { $scope._Layer.params.joins = []; }

            // First verify that the join does not exists
            for (const j in $scope._Layer.params.joins) {
                if (($scope._Layer.params.joins[j].sourceElementID === sourceID && $scope._Layer.params.joins[j].targetElementID === targetID) ||
                    ($scope._Layer.params.joins[j].sourceElementID === targetID && $scope._Layer.params.joins[j].targetElementID === sourceID)) {
                    const connections = instance.getAllConnections();

                    for (const c in connections) {
                        const source = connections[c].endpoints[0].getElement().id;
                        const target = connections[c].endpoints[1].getElement().id;

                        if ((target === sourceID && source === targetID) ||
                                (target === targetID && source === sourceID)) {
                            $scope._Layer.params.joins[j].connection = undefined;
                            $scope.instance.deleteConnection(connections[c]);
                        }
                    }

                    $scope._Layer.params.joins.splice(j, 1);
                }
            }
        }

        /*
         * The collections form a graph, and the joins are edges
         * A query can only contain elements from a single connected component,
         * otherwise it is impossible to join the collections
         */
        $scope.calculateComponents = function () {
            if (!$scope._Layer.params.joins) {
                $scope._Layer.params.joins = [];
            }

            const collections = new Map($scope._Layer.params.schema.map(c => [c.collectionID, c]));

            // Assign componentIdx to collection given in parameters and all
            // connected collections
            function visitComponent (collection, componentIdx) {
                collection.component = componentIdx;
                for (const join of $scope._Layer.params.joins) {
                    let c;
                    if (join.sourceCollectionID === collection.collectionID) {
                        c = collections.get(join.targetCollectionID);
                    } else if (join.targetCollectionID === collection.collectionID) {
                        c = collections.get(join.sourceCollectionID);
                    }

                    if (c && !c.component) {
                        visitComponent(c, componentIdx);
                    }
                }
            }

            let componentIdx = 1;
            collections.forEach(c => { c.component = 0; });
            collections.forEach(c => {
                if (!c.component) {
                    visitComponent(c, componentIdx);
                    componentIdx++;
                }
            });

            $scope.forAllElements(function (element) {
                if (!element.isCustom) {
                    const collection = collections.get(element.collectionID);
                    element.component = collection.component;
                } else {
                    element.component = undefined;

                    try {
                        for (const el of layerUtils.getElementsUsedInCustomExpression(element.viewExpression, $scope._Layer)) {
                            if (el.isCustom) {
                                continue;
                            }
                            const collection = collections.get(el.collectionID);
                            const comp = collection.component;
                            if (element.component !== undefined && element.component !== comp) {
                                element.component = -1;
                                const msg = i18n.gettext('One of the custom elements uses elements from tables which are not joined. This custom element cannot be fetched');
                                notify.notice(msg);
                                return;
                            }
                            element.component = comp;
                        }
                    } catch (error) {
                        const message = i18n.gettext('Failed to parse expression for element') + ' ' +
                            element.elementLabel + ' : ' + error.message;
                        notify.notice(message);
                    }
                }
            });
        };

        let instance;

        $scope.erDiagramInit = function () {
            if (!$scope.initiated) {
            // this timeout is here to give time to angular to create the element's divs'
                setTimeout(function () {
                    instance = jsPlumb.getInstance({
                        Connector: ['Flowchart', { cornerRadius: 5 }],
                        Endpoint: ['Dot', { radius: 2 }],
                        PaintStyle: {
                            strokeWidth: 4,
                            stroke: '#61B7CF',
                            outlineStroke: 'white',
                            outlineWidth: 2,
                        },
                        HoverPaintStyle: {
                            strokeWidth: 4,
                            stroke: '#216477',
                            outlineWidth: 2,
                            outlineStroke: 'white',
                        },
                        DragOptions: { cursor: 'pointer', zIndex: 2000 },
                        Container: 'canvas'
                    });

                    const rightJoinType = {
                        overlays: [
                            ['Label', { location: 0.88, label: '[' + i18n.gettext('right') + ']', labelStyle: { cssClass: 'leftJoinType', color: '#000', font: 'bold 14px ER', fill: ' #fff no-repeat fixed center' } }]
                        ]

                    };

                    const leftJoinType = {
                        overlays: [
                            ['Label', { location: 0.10, label: '[' + i18n.gettext('left') + ']', labelStyle: { cssClass: 'leftJoinType', color: '#000', font: 'bold 14px ER', fill: ' #fff no-repeat fixed center' } }]
                        ]
                    };

                    instance.registerConnectionType('right', rightJoinType);
                    instance.registerConnectionType('left', leftJoinType);

                    const endpointHoverStyle = {
                        fill: '#000000',
                        stroke: '#000000' // stroke: "#216477"
                    };

                    const init = function (connection) {
                    // connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
                    };
                    /*****************/
                    const jtkField = jsPlumb.getSelector('.jtk-field');
                    /*****************/
                    // suspend drawing and initialise.
                    instance.batch(function () {
                        instance.makeSource(jtkField, {
                            filter: 'a',
                            filterExclude: true,
                            hoverPaintStyle: endpointHoverStyle,
                            maxConnections: -1,
                            anchor: ['LeftMiddle', 'RightMiddle']
                        });

                        instance.makeTarget(jtkField, {
                            dropOptions: { hoverClass: 'hover' },
                            anchor: ['LeftMiddle', 'RightMiddle']
                        });

                        // listen for new connections; initialise them the same way we initialise the connections at startup.
                        instance.bind('connection', function (connInfo, originalEvent) {
                            init(connInfo.connection);
                        });

                        instance.draggable(document.querySelectorAll('.window'), {
                            drag: function (e) {
                                jsPlumb.repaint($(this));
                            },
                            stop: function (event) {
                                if (typeof event.pos !== 'undefined') {
                                    let pos_x = event.pos[0];
                                    let pos_y = event.pos[1];

                                    if (pos_x < 0) { pos_x = 0; }

                                    if (pos_y < 0) { pos_y = 0; }

                                    const parentId = event.el.getAttribute('id');

                                    const id = parentId.replace('-parent', '');

                                    for (const c in $scope._Layer.params.schema) {
                                        if ($scope._Layer.params.schema[c].collectionID === id) {
                                            $scope._Layer.params.schema[c].left = pos_x;
                                            $scope._Layer.params.schema[c].top = pos_y;
                                        }
                                    }
                                }
                            }
                        });

                        for (const j in $scope._Layer.params.joins) {
                            const c = instance.connect({ source: $scope._Layer.params.joins[j].targetElementID, target: $scope._Layer.params.joins[j].sourceElementID, id: $scope._Layer.params.joins[j].joinID });

                            if ($scope._Layer.params.joins[j].joinType === 'left') { c.setType('left'); }
                            if ($scope._Layer.params.joins[j].joinType === 'right') { c.setType('right'); }
                        }
                        /*****************/

                        //
                        // listen for clicks on connections, and offer to delete connections on click.
                        //
                        instance.bind('click', function (conn, originalEvent) {
                            for (const j in $scope._Layer.params.joins) {
                                if (($scope._Layer.params.joins[j].sourceElementID === conn.sourceId && $scope._Layer.params.joins[j].targetElementID === conn.targetId) ||
                                 ($scope._Layer.params.joins[j].sourceElementID === conn.targetId && $scope._Layer.params.joins[j].targetElementID === conn.sourceId)) {
                                    $scope._Layer.params.joins[j].connection = conn;
                                    selectJoin($scope._Layer.params.joins[j]);
                                }
                            }

                            originalEvent.stopPropagation();
                            conn.setPaintStyle({ stroke: '#000', strokeWidth: 4 });
                            conn.selected = true;
                        });

                        instance.bind('connectionDrag', function (connection) {

                        });

                        instance.bind('dblclick', function (connection, originalEvent) {

                        });

                        instance.bind('click', function (connection, originalEvent) {

                        });

                        instance.bind('beforeDrop', function (info) {
                        // Here we can control if we are going to accept the join or not...
                            return true;
                        });

                        instance.bind('connectionMoved', function (params) {

                        });

                        instance.bind('connectionDetached', function (info, originalEvent) {
                            deleteJoin(info.sourceId, info.targetId);
                        });

                        instance.bind('connection', function (info, originalEvent) {
                            makeJoin(info.sourceId, info.targetId);
                        });
                    });

                    jsPlumb.fire('jsPlumbDemoLoaded', instance);

                    $scope.instance = instance;
                }, 100);

                $scope.initiated = true;
            }
        };

        function selectJoin (join) {
            unSelect();
            $scope.selectedItem = 'join';
            $scope.tabs.selected = 'properties';
            $scope.theSelectedElement = join;
            $scope.$apply();
        }

        $scope.isInAJoin = function (element) {
            if (!$scope._Layer.params.joins) {
                return false;
            }
            for (const j of $scope._Layer.params.joins) {
                if (j.sourceCollectionID === element.collectionID && j.sourceElementID === element.elementID) {
                    return true;
                }
                if (j.targetCollectionID === element.collectionID && j.targetElementID === element.elementID) {
                    return true;
                }
            }
            return false;
        };

        $scope.toggleFolded = function (collection) {
            collection.folded = !collection.folded;
            setTimeout(function () {
                const collectionObject = $('#' + collection.collectionID + '-parent')[0];
                instance.recalculateOffsets(collectionObject);
                instance.repaintEverything();
            }, 100);
        };

        $scope.createComposedElement = function () {
            $scope.calculateComponents();

            const element = {
                isCustom: true,
                elementID: layerEditService.newID($scope._Layer),
                viewExpression: '',
                elementName: 'comp',
            };

            const modal = $uibModal.open({
                component: 'appLayerEditElementModal',
                resolve: {
                    element: () => element,
                    layer: () => $scope._Layer,
                },
            });

            modal.result.then(function (modifiedElement) {
                angular.copy(modifiedElement, element);
                if (!$scope._Layer.objects) {
                    $scope._Layer.objects = [];
                }
                $scope._Layer.objects.push(element);
            }, function () {});
        };

        $scope.elementAdd = function (element) {
            const modal = $uibModal.open({
                component: 'appLayerEditElementModal',
                resolve: {
                    element: () => element,
                    layer: () => $scope._Layer,
                },
            });

            modal.result.then(function (modifiedElement) {
                angular.copy(modifiedElement, element);
                if (!$scope._Layer.objects) {
                    $scope._Layer.objects = [];
                }
                $scope._Layer.objects.push(element);
            }, function () {});
        };

        $scope.promptAddAll = function (collection) {
            const modal = $uibModal.open({
                component: 'appLayerEditAddAllModal',
                resolve: {
                    collection: () => collection,
                },
            });

            modal.result.then(function () {
                for (const el of collection.elements) {
                    if (!el.elementRole) {
                        el.elementRole = 'dimension';
                        $scope._Layer.objects.push(el);
                    }
                }
            }, function () {});
        };

        $scope.allElementsAdded = function (collection) {
            for (const el of collection.elements) {
                if (!el.elementRole) {
                    return false;
                }
            }
            return true;
        };

        $scope.editElement = function (element) {
            const modal = $uibModal.open({
                component: 'appLayerEditElementModal',
                resolve: {
                    element: () => element,
                    layer: () => $scope._Layer,
                },
            });

            modal.result.then(function (modifiedElement) {
                angular.copy(modifiedElement, element);
            }, function () {});
        };

        $scope.addFolder = function () {
            const elementID = 'F' + layerEditService.newID($scope._Layer);

            const element = {};
            element.elementLabel = i18n.gettext('my folder');
            element.elementRole = 'folder';
            element.elementID = elementID;
            element.editing = true;
            element.elements = [];
            $scope._Layer.objects.push(element);
        };

        $scope.deleteSchemaElement = function (element) {
            const elementID = element.elementID;

            for (const s in $scope._Layer.params.schema) {
                for (const e in $scope._Layer.params.schema[s].elements) {
                    if ($scope._Layer.params.schema[s].elements[e].elementID === elementID) {
                        delete $scope._Layer.params.schema[s].elements[e].elementRole;
                    }
                }
            }

            checkfordelete($scope.rootItem.elements, elementID);
        };

        function checkfordelete (elements, elementID) {
            for (const i in elements) {
                if (elements[i].elementID === elementID) {
                    unassingElementRole(elements[i]);
                    elements.splice(i, 1);
                    return;
                } else {
                    if (elements[i].elements) {
                        checkfordelete(elements[i].elements, elementID);
                    }
                }
            }
        }

        function unassingElementRole (element) {
            const elementID = element.elementID;

            for (const s in $scope._Layer.params.schema) {
                for (const e in $scope._Layer.params.schema[s].elements) {
                    if ($scope._Layer.params.schema[s].elements[e].elementID === elementID) {
                        delete $scope._Layer.params.schema[s].elements[e].elementRole;
                    }
                }
            }

            if (element.elements) {
                if (element.elements.length > 0) {
                    for (const i in element.elements) {
                        unassingElementRole(element.elements[i]);
                    }
                }
            }
        }

        // Drag & drop elements
        $scope.onDrag = false;
        $scope.sortableOptions = {
            connectWith: '.schema-container',
            update: function (e, ui) {

            },
            start: function (e, ui) {
                $scope.$apply(function () {
                    $scope.onDrag = true;
                });
            },
            stop: function (e, ui) {
                $scope.$apply(function () {
                    $scope.onDrag = false;
                });
            }
        };

        $scope.deleteCollection = function (collection) {
            const theCollectionID = collection.collectionID;

            deleteAllCollectionJoins(theCollectionID);

            deleteAllCollectionElements($scope.rootItem.elements, theCollectionID);

            // delete all joins related to this collection

            for (const c in $scope._Layer.params.schema) {
                if ($scope._Layer.params.schema[c].collectionID === theCollectionID) {
                    for (const element in $scope._Layer.params.schema[c].elements) {
                        instance.deleteEndpoint($scope._Layer.params.schema[c].elements[element].elementID);
                        instance.deleteEndpoint($scope._Layer.params.schema[c].elements[element].elementID);
                    }
                    $scope._Layer.params.schema.splice(c, 1);
                }
            }

            $scope.selectedCollection = undefined;
        };

        function deleteAllCollectionJoins (collectionID) {
            const joinsToDelete = [];

            for (const o in $scope._Layer.params.schema) {
                if ($scope._Layer.params.schema[o].collectionID === collectionID) {
                    for (const e in $scope._Layer.params.schema[o].elements) {
                        for (const j in $scope._Layer.params.joins) {
                            if (($scope._Layer.params.joins[j].sourceElementID === $scope._Layer.params.schema[o].elements[e].elementID) ||
                                                ($scope._Layer.params.joins[j].targetElementID === $scope._Layer.params.schema[o].elements[e].elementID)) {
                                joinsToDelete.push({ sourceElementID: $scope._Layer.params.joins[j].sourceElementID, targetElementID: $scope._Layer.params.joins[j].targetElementID });
                            }
                        }
                    }
                }
            }

            for (const jtd in joinsToDelete) {
                deleteJoin(joinsToDelete[jtd].sourceElementID, joinsToDelete[jtd].targetElementID);
            }
        }

        function deleteAllCollectionElements (elements, collectionID) {
            for (let e = elements.length - 1; e >= 0; e--) {
                if (elements[e].elements) { deleteAllCollectionElements(elements[e].elements, collectionID); }

                if (elements[e].collectionID === collectionID) {
                    elements.splice(e, 1);
                }
            }
        }

        $scope.getDatasetsForThisDts = function (_id, theDataSource) {
            if (!theDataSource.loading) {
                theDataSource.loading = true;
                api.getDatasourceCollections(_id).then(function (data) {
                    theDataSource.loading = false;
                    theDataSource.entities = data.data;
                });
            }
        };

        $scope.selectedCanvas = function (event) {
            unSelect();
            $scope.selectedItem = 'layer';
            $scope.theSelectedElement = $scope._Layer;
            $scope.tabs.selected = 'properties';
        };

        function unSelect () {
            for (const s in $scope.selectedElements) {
                $('#' + $scope.selectedElements[s]).removeClass('selectedElement');
            }
            const connections = instance.getAllConnections();

            for (const c in connections) {
                // connections[c].setType("default"); esto cambia el tipo left right, es solo el color lo que queremos cambiar
                connections[c].setPaintStyle({ stroke: '#61B7CF', strokeWidth: 4 });
                connections[c].selected = false;
            }

            $('#' + $scope.selectedTargetId).css({ backgroundColor: '#d5d5d5' });
            $('#' + $scope.selectedSourceId).css({ backgroundColor: '#d5d5d5' });
            $scope.selectedTargetId = undefined;
            $scope.selectedSourceId = undefined;
            $scope.selectedConnection = undefined;
            $scope.selectedElements = [];
            $scope.selectedItem = '';
        }

        $scope.selectCollection = function (theCollection, event) {
            event.stopPropagation();
            if (!event.shiftKey || $scope.selectedItem !== 'collection') {
                unSelect();
            }

            $scope.selectedItem = 'collection';
            $scope.theSelectedElement = theCollection;
            // if ($scope.joinMode)
            //  collectionHighliter(theCollection.collectionID);

            if ($scope.selectedElements) {
                if ($scope.selectedElements.indexOf(theCollection.collectionID) === -1) { $scope.selectedElements.push(theCollection.collectionID); }
            }

            setSelectedElements();
        };

        $scope.selectElement = function (theElement, event) {
            event.stopPropagation();
            unSelect();
            $scope.selectedItem = 'element';
            $scope.theSelectedElement = theElement;
            if (theElement.isPK) { $scope.selected_primary_key = true; } else { $scope.selected_primary_key = false; }

            if ($scope.selectedElements) {
                if ($scope.selectedElements.indexOf(theElement.elementID) === -1) { $scope.selectedElements.push(theElement.elementID); }
            }

            setSelectedElements();
        };

        function setSelectedElements () {
            for (const s in $scope.selectedElements) {
                $('#' + $scope.selectedElements[s]).addClass('selectedElement');
            }
            $scope.tabs.selected = 'properties';
        }

        $scope.addDatasetToLayer = function (datasourceID, collectionName) {
            if ($scope._Layer.datasourceID === datasourceID) {
                api.getDatasourceCollection(datasourceID, collectionName).then(function (collection) {
                    collection.collectionID = 'C' + layerEditService.newID($scope._Layer);

                    for (const element of collection.elements) {
                        element.elementID = layerEditService.newID($scope._Layer);
                        element.collectionID = collection.collectionID;
                        element.collectionName = collection.collectionName;
                    }

                    if (!$scope._Layer.params) { $scope._Layer.params = {}; }
                    if (!$scope._Layer.params.schema) { $scope._Layer.params.schema = []; }

                    $scope._Layer.params.schema.push(collection);

                    setTimeout(function () {
                        for (const element in collection.elements) {
                            if (!collection.elements[element].painted) {
                                _addEndpoints(collection.elements[element].elementID, ['RightMiddle'], ['LeftMiddle']);
                            }
                        }
                        setDraggable('#' + collection.collectionID + '-parent');
                    }, 100);

                    $scope.erDiagramInit();
                });
            } else {
                notify.error(i18n.gettext('Datasource must be the same for all entities'));
            }
        };

        $scope.deleteObject = function (object, objectType) {
            if ($scope.selectedItem === 'join') {
                deleteJoin($scope.theSelectedElement.sourceElementID, $scope.theSelectedElement.targetElementID);
                unSelect();
            }
            if ($scope.selectedItem === 'collection') {
                $scope.deleteCollection($scope.theSelectedElement);
                unSelect();
            }
        };

        $scope.editObject = function () {
            if ($scope.selectedItem === 'collection' && $scope.theSelectedElement.isSQL) {
                $scope.editSQL();
            }
        };

        $scope.forAllElements = function (f) {
            function explore (elementList) {
                for (const el of elementList) {
                    if (el.elements) {
                        explore(el.elements);
                    } else {
                        f(el);
                    }
                }
            }

            explore($scope._Layer.objects);
        };
    }
})();
